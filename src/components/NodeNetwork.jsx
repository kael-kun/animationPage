import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, forceX, forceY } from 'd3-force';
import useStore from '../stores/useStore';
import { peopleData, connections } from '../data/people';

const getNodeSize = (count) => {
  if (count <= 10) return 16 + Math.sqrt(count) * 2;
  if (count <= 50) return 22 + Math.sqrt(count - 10) * 2.5;
  if (count <= 150) return 40 + Math.sqrt(count - 50) * 1.5;
  return 60 + Math.min(Math.sqrt(count - 150) * 0.5, 10);
};

const getGlowIntensity = (count) => {
  if (count <= 10) return 0.2;
  if (count <= 50) return 0.4;
  if (count <= 150) return 0.7;
  return 1.0;
};

const getTierColor = (count) => {
  if (count <= 50) return { primary: '#FF9800', secondary: '#FF5722', name: 'bronze' };
  if (count <= 150) return { primary: '#00BCD4', secondary: '#2196F3', name: 'silver' };
  return { primary: '#A259FF', secondary: '#E91E63', name: 'gold' };
};

export default function NodeNetwork() {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);

  const { selectedNode, hoveredNode, selectNode, setHoveredNode, reducedMotion } = useStore();

  const [particleProgress, setParticleProgress] = useState({});
  const bgCanvasRef = useRef(null);
  const [hoverBursts, setHoverBursts] = useState([]);
  const [ripples, setRipples] = useState([]);
  const [sparkles, setSparkles] = useState([]);
  const draggingRef = useRef(null);
  const [dragTrails, setDragTrails] = useState([]);

  const handleNodeHover = useCallback((nodeId) => {
    if (reducedMotion) return;
    setHoveredNode(nodeId);
    const node = nodes.find(n => n.id === nodeId);
    if (node && node.letterCount > 50) {
      const burst = {
        id: Date.now(),
        x: node.x,
        y: node.y,
        size: getNodeSize(node.letterCount)
      };
      setHoverBursts(prev => [...prev, burst]);
      setTimeout(() => {
        setHoverBursts(prev => prev.filter(b => b.id !== burst.id));
      }, 600);
    }
  }, [nodes, reducedMotion, setHoveredNode]);
  const [energyWaves, setEnergyWaves] = useState([]);
  const [focusedNode, setFocusedNode] = useState(null);

  useEffect(() => {
    if (energyWaves.length === 0 || reducedMotion) return;
    let startTime = null;
    const animate = (time) => {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / 1000, 1);
      
      setEnergyWaves(prev => prev.map(w => ({ ...w, progress })));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [energyWaves.length, reducedMotion]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!draggingRef.current || !simulationRef.current) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const node = nodes.find(n => n.id === draggingRef.current);
      if (node) {
        const clampedX = Math.max(50, Math.min(dimensions.width - 50, x));
        const clampedY = Math.max(50, Math.min(dimensions.height - 50, y));
        node.fx = clampedX;
        node.fy = clampedY;
        
        if (!reducedMotion) {
          const trail = {
            id: Date.now() + Math.random(),
            x: clampedX,
            y: clampedY,
            size: 6
          };
          setDragTrails(prev => [...prev.slice(-20), trail]);
        }
        
        if ((clampedX <= 55 || clampedX >= dimensions.width - 55 || 
             clampedY <= 55 || clampedY >= dimensions.height - 55) && !reducedMotion) {
          document.body.style.boxShadow = `inset 0 0 30px rgba(0, 229, 255, 0.3)`;
          setTimeout(() => { document.body.style.boxShadow = ''; }, 150);
        }
      }
    };

    const handleMouseUp = () => {
      if (!draggingRef.current || !simulationRef.current) return;
      const node = nodes.find(n => n.id === draggingRef.current);
      const draggedId = draggingRef.current;
      
      if (node && !reducedMotion) {
        const connectedNodeIds = new Set();
        links.forEach(link => {
          const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
          const targetId = typeof link.target === 'object' ? link.target.id : link.target;
          if (sourceId === draggedId) connectedNodeIds.add(targetId);
          if (targetId === draggedId) connectedNodeIds.add(sourceId);
        });
        
        const wave = {
          id: Date.now(),
          originId: draggedId,
          connectedIds: Array.from(connectedNodeIds),
          progress: 0
        };
        setEnergyWaves(prev => [...prev, wave]);
        setTimeout(() => setEnergyWaves(prev => prev.filter(w => w.id !== wave.id)), 1000);
      }
      
      if (node) {
        node.fx = null;
        node.fy = null;
        simulationRef.current.alpha(0.1).restart();
      }
      draggingRef.current = null;
      setDragTrails([]);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [nodes, dimensions, reducedMotion]);

  const handleDragEnd = useCallback((nodeId) => {
    if (!draggingRef.current || !simulationRef.current) return;
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      node.fx = null;
      node.fy = null;
    }
    draggingRef.current = null;
  }, [nodes]);

  useEffect(() => {
    if (reducedMotion || links.length === 0) return;
    
    let startTime = null;
    const duration = 2500;
    
    const animate = (time) => {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      const progress = (elapsed % duration) / duration;
      
      setParticleProgress(prev => {
        const next = { ...prev };
        links.forEach((_, i) => {
          next[i] = (progress + i * 0.15) % 1;
        });
        return next;
      });
      
      requestAnimationFrame(animate);
    };
    
    const frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [links, reducedMotion, dimensions]);

  useEffect(() => {
    if (reducedMotion || !bgCanvasRef.current) return;

    const canvas = bgCanvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * dimensions.width,
      y: Math.random() * dimensions.height,
      radius: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.3 + 0.1
    }));

    const floaters = Array.from({ length: 8 }, () => ({
      x: Math.random() * dimensions.width,
      y: Math.random() * dimensions.height,
      radius: Math.random() * 60 + 40,
      speedX: (Math.random() - 0.5) * 0.15,
      speedY: (Math.random() - 0.5) * 0.15,
      hue: Math.random() * 60 + 170
    }));

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      floaters.forEach(f => {
        f.x += f.speedX;
        f.y += f.speedY;
        if (f.x < -f.radius) f.x = dimensions.width + f.radius;
        if (f.x > dimensions.width + f.radius) f.x = -f.radius;
        if (f.y < -f.radius) f.y = dimensions.height + f.radius;
        if (f.y > dimensions.height + f.radius) f.y = -f.radius;

        const gradient = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius);
        gradient.addColorStop(0, `hsla(${f.hue}, 80%, 60%, 0.03)`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = dimensions.width;
        if (p.x > dimensions.width) p.x = 0;
        if (p.y < 0) p.y = dimensions.height;
        if (p.y > dimensions.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 229, 255, ${p.opacity})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [reducedMotion, dimensions]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const simulationRef = useRef(null);

  useEffect(() => {
    const nodesWithPositions = peopleData.people.map(p => ({
      ...p,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      x: dimensions.width / 2 + (Math.random() - 0.5) * 200,
      y: dimensions.height / 2 + (Math.random() - 0.5) * 200
    }));

    const linksData = connections.map(([sourceId, targetId]) => ({
      source: sourceId,
      target: targetId
    })).filter(l => l.source && l.target);

    const simulation = forceSimulation(nodesWithPositions)
      .force('link', forceLink(linksData).id(d => d.id).distance(120))
      .force('charge', forceManyBody().strength(-200))
      .force('center', forceCenter(dimensions.width / 2, dimensions.height / 2).strength(0.05))
      .force('collision', forceCollide().radius(d => getNodeSize(d.letterCount) + 15))
      .force('x', forceX(dimensions.width / 2).strength(0.01))
      .force('y', forceY(dimensions.height / 2).strength(0.01))
      .alphaDecay(0.005)
      .velocityDecay(0.2);

    simulationRef.current = simulation;

    if (reducedMotion) {
      for (let i = 0; i < 300; i++) simulation.tick();
      setNodes([...nodesWithPositions]);
    } else {
      simulation.on('tick', () => {
        nodesWithPositions.forEach(n => {
          n.x = Math.max(50, Math.min(dimensions.width - 50, n.x));
          n.y = Math.max(50, Math.min(dimensions.height - 50, n.y));
        });
        setNodes([...nodesWithPositions]);
      });
      simulation.restart();
    }

    setLinks(linksData);
    setParticleProgress({});

    return () => {
      simulation.stop();
    };
  }, [dimensions, reducedMotion]);

  useEffect(() => {
    if (reducedMotion || !simulationRef.current) return;
    const simulation = simulationRef.current;
    const nodes = simulation.nodes();

    const pulseNodes = () => {
      nodes.forEach(node => {
        const angle = Math.random() * Math.PI * 2;
        const strength = Math.random() * 0.5;
        node.vx += Math.cos(angle) * strength;
        node.vy += Math.sin(angle) * strength;
      });
      simulation.alpha(0.1).restart();
    };

    const interval = setInterval(pulseNodes, 3000);
    return () => clearInterval(interval);
  }, [nodes.length, reducedMotion]);

  const particlePositions = useMemo(() => {
    if (reducedMotion || links.length === 0) return [];
    const particles = [];
    links.forEach((link, i) => {
      for (let j = 0; j < 5; j++) {
        particles.push({
          id: `${i}-${j}`,
          linkIndex: i,
          offset: Math.random(),
          position: j / 4,
          size: j === 0 ? 4 : j === 4 ? 1.5 : 2.5 - j * 0.25,
          type: j === 0 ? 'head' : j === 4 ? 'tail' : 'trail'
        });
      }
    });
    return particles;
  }, [links, reducedMotion]);

  const renderParticles = useMemo(() => {
    if (reducedMotion) return [];
    return links.map((link, linkIndex) => {
      const source = typeof link.source === 'object' ? link.source : nodes.find(n => n.id === link.source);
      const target = typeof link.target === 'object' ? link.target : nodes.find(n => n.id === link.target);
      if (!source || !target) return null;

      const progress = particleProgress[linkIndex] || 0;
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const sourceTier = getTierColor(source.letterCount);
      const targetTier = getTierColor(target.letterCount);

      return (
        <g key={`particles-${linkIndex}`}>
          {[0, 0.25, 0.5, 0.75].map((offset, i) => {
            const p = (progress + offset) % 1;
            const x = source.x + dx * p;
            const y = source.y + dy * p;
            const size = i === 0 ? 4 : i === 3 ? 1.5 : 2.5;
            const isHead = i === 0;
            const isTail = i === 3;
            const tierColor = isHead ? sourceTier.primary : isTail ? targetTier.primary : '#00E5FF';
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={size}
                fill={tierColor}
                className={`particle ${isHead ? 'particle-head' : isTail ? 'particle-tail' : 'particle-trail'}`}
                filter={isHead ? 'url(#particleGlow)' : undefined}
                style={{ '--particle-color': tierColor }}
              />
            );
          })}
        </g>
      );
    });
  }, [links, nodes, particleProgress, reducedMotion]);

  const connectedNodeIds = useMemo(() => {
    if (!hoveredNode) return new Set();
    const connected = new Set();
    links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      if (sourceId === hoveredNode) connected.add(targetId);
      if (targetId === hoveredNode) connected.add(sourceId);
    });
    return connected;
  }, [links, hoveredNode]);

  return (
    <div ref={containerRef} className="node-network-container">
      <canvas
        ref={bgCanvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="bg-canvas"
      />
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="node-network-svg"
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="plasma" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0.3  0 1 0 0 0.8  0 0 1 0 0.5  0 0 0 1.5 0" result="colored" />
            <feMerge>
              <feMergeNode in="colored" />
              <feMergeNode in="colored" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="particleGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feFlood floodColor="#00E5FF" floodOpacity="0.8" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="electricGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#00E5FF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#A259FF" stopOpacity="0.1" />
          </linearGradient>
          <radialGradient id="nodeGradient">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="100%" stopColor="#A259FF" />
          </radialGradient>
          <clipPath id="avatarClip">
            <circle r="1" cx="0" cy="0" />
          </clipPath>
        </defs>

<g className="links">
          {links.map((link, i) => {
            const source = typeof link.source === 'object' ? link.source : nodes.find(n => n.id === link.source);
            const target = typeof link.target === 'object' ? link.target : nodes.find(n => n.id === link.target);
            if (!source || !target) return null;

            const isDimmed = selectedNode && selectedNode !== source.id && selectedNode !== target.id;
            const isHighlighted = hoveredNode && (hoveredNode === source.id || hoveredNode === target.id);

            return (
              <g key={i}>
                <line
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  className={`connection-line ${isDimmed ? 'dimmed' : ''} ${isHighlighted ? 'highlighted' : ''}`}
                />
                <line
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  className="electric-glow"
                />
              </g>
            );
          })}
</g>

        <g className="particles">
          {renderParticles}
        </g>

        <g className="nodes">
          {nodes.map((node) => {
            const size = getNodeSize(node.letterCount);
            const glow = getGlowIntensity(node.letterCount);
            const tier = getTierColor(node.letterCount);
            const isSelected = selectedNode === node.id;
            const isHovered = hoveredNode === node.id;
            const isConnected = hoveredNode && connectedNodeIds.has(node.id);
            const isDimmed = (selectedNode && selectedNode !== node.id) || (focusedNode && focusedNode !== node.id);

            return (
              <g
                key={node.id}
                className={`node node-${tier.name} ${isSelected ? 'selected' : ''} ${isDimmed ? 'dimmed' : ''} ${isConnected ? 'connected' : ''}`}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (simulationRef.current) {
                    node.fx = node.x;
                    node.fy = node.y;
                    simulationRef.current.alpha(0.3).restart();
                    draggingRef.current = node.id;
                  }
                }}
                onClick={(e) => {
                  if (e.detail === 2) {
                    setFocusedNode(focusedNode === node.id ? null : node.id);
                  } else {
                    selectNode(node.id);
                    if (!reducedMotion && node.letterCount > 150) {
                      const ripple = {
                        id: Date.now(),
                        x: node.x,
                        y: node.y,
                        size: getNodeSize(node.letterCount)
                      };
                      setRipples(prev => [...prev, ripple]);
                      setTimeout(() => {
                        setRipples(prev => prev.filter(r => r.id !== ripple.id));
                      }, 1500);
                    }
                  }
                }}
                onMouseEnter={() => handleNodeHover(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onKeyDown={(e) => e.key === 'Enter' && selectNode(node.id)}
                tabIndex={0}
                role="button"
                aria-label={`${node.name}, ${node.letterCount} thank you letters`}
                style={{ '--tier-primary': tier.primary, '--tier-secondary': tier.secondary, cursor: 'grab' }}
              >
                <circle
                  r={size + 10}
                  className="node-glow"
                  style={{ opacity: glow * 0.5, fill: tier.primary }}
                  filter="url(#glow)"
                />
                <defs>
                  <clipPath id={`avatar-${node.id}`}>
                    <circle r={size} />
                  </clipPath>
                </defs>
                <circle
                  r={size}
                  fill="#1a1a2e"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1.5"
                />
                <image
                  href={node.avatar}
                  x={-size}
                  y={-size}
                  width={size * 2}
                  height={size * 2}
                  clipPath={`url(#avatar-${node.id})`}
                  preserveAspectRatio="xMidYMid slice"
                />
                <text
                  y={size + 16}
                  textAnchor="middle"
                  className="node-label"
                >
                  {node.name}
                </text>
                <text
                  y={size + 30}
                  textAnchor="middle"
                  className="node-count"
                >
                  {node.letterCount} letters
                </text>
                {node.letterCount > 150 && !reducedMotion && (
                  <circle
                    r={size + 15}
                    className="pulsing-ring"
                  />
                )}
              </g>
            );
          })}
        </g>

        <g className="hover-bursts">
          {hoverBursts.map(burst => (
            <g key={burst.id}>
              {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                return (
                  <circle
                    key={i}
                    cx={burst.x + Math.cos(angle) * 15}
                    cy={burst.y + Math.sin(angle) * 15}
                    r={3}
                    fill="#00E5FF"
                    className="burst-particle"
                    style={{ '--angle': angle }}
                  />
                );
              })}
            </g>
          ))}
        </g>

        <g className="ripples">
          {ripples.map(ripple => (
            <circle
              key={ripple.id}
              cx={ripple.x}
              cy={ripple.y}
              r={ripple.size}
              fill="none"
              stroke="url(#electricGradient)"
              strokeWidth="2"
              className="ripple-ring"
            />
          ))}
        </g>

        <g className="sparkles">
          {sparkles.map(sparkle => (
            <g key={sparkle.id} transform={`translate(${sparkle.x}, ${sparkle.y})`}>
              <circle r="2" fill="#FFD700" className="sparkle-star" style={{ animationDelay: `${sparkle.delay}s` }} />
              <circle r="1.5" fill="#FFF" className="sparkle-star" style={{ animationDelay: `${sparkle.delay + 0.2}s`, transform: 'rotate(45deg)' }} />
            </g>
          ))}
        </g>

        <g className="drag-trails">
          {dragTrails.map(trail => (
            <circle
              key={trail.id}
              cx={trail.x}
              cy={trail.y}
              r={trail.size}
              fill="#00E5FF"
              className="drag-trail-particle"
            />
          ))}
        </g>

        <g className="energy-waves">
          {energyWaves.map(wave => {
            const originNode = nodes.find(n => n.id === wave.originId);
            if (!originNode) return null;
            const radius = 50 + wave.progress * 200;
            const opacity = 0.8 - wave.progress * 0.8;
            return (
              <circle
                key={wave.id}
                cx={originNode.x}
                cy={originNode.y}
                r={radius}
                fill="none"
                stroke={wave.connectedIds.length > 0 ? "#A259FF" : "#00E5FF"}
                strokeWidth={3 - wave.progress * 2}
                opacity={opacity}
                className="energy-wave"
              />
            );
          })}
        </g>
      </svg>

      <ul className="sr-only" aria-live="polite">
        {nodes.map(n => `${n.name}: ${n.letterCount} letters`).join(', ')}
      </ul>
    </div>
  );
}
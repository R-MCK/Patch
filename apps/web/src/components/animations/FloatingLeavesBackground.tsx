import React from 'react'

interface Leaf {
    id: number
    x: number
    y: number
    rotation: number
    scale: number
    speed: number
    sway: number
    delay: number
}

function createLeaves(): Leaf[] {
    return Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -20 - Math.random() * 20,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.8,
        speed: 10 + Math.random() * 25,
        sway: 3 + Math.random() * 5,
        delay: Math.random() * 15,
    }))
}

export function FloatingLeavesBackground() {
    const [leaves] = React.useState<Leaf[]>(createLeaves)

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-20 dark:opacity-10">
            {leaves.map((leaf) => (
                <div
                    key={leaf.id}
                    className="absolute text-primary/40 animate-leaf-fall drop-shadow-sm"
                    style={{
                        left: `${leaf.x}%`,
                        top: `${leaf.y}%`,
                        transform: `scale(${leaf.scale}) rotate(${leaf.rotation}deg)`,
                        animationDuration: `${leaf.speed}s, ${leaf.sway}s`,
                        animationDelay: `${leaf.delay}s, ${leaf.delay}s`,
                    }}
                >
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                        <path d="M12,2C12,2 8,6 8,12C8,18 12,22 12,22C12,22 16,18 16,12C16,6 12,2 12,2Z" />
                    </svg>
                </div>
            ))}
        </div>
    )
}

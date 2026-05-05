export function SproutLoader() {
    return (
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <div className="relative w-16 h-16">
                <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full text-primary animate-plant-bounce"
                    style={{ animationIterationCount: 'infinite', animationDuration: '1.5s' }}
                >
                    {/* Ground */}
                    <path
                        d="M 20 80 Q 50 75 80 80 L 80 90 L 20 90 Z"
                        fill="currentColor"
                        className="opacity-20"
                    />
                    {/* Stem */}
                    <path
                        d="M 50 80 C 50 80, 45 40, 50 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                    />
                    {/* Left Leaf */}
                    <path
                        d="M 48 50 C 30 50, 20 30, 48 35 Z"
                        fill="currentColor"
                    />
                    {/* Right Leaf */}
                    <path
                        d="M 50 35 C 70 35, 80 15, 52 20 Z"
                        fill="currentColor"
                        className="opacity-80"
                    />
                </svg>
            </div>
            <p className="text-sm font-medium text-earth-600 animate-pulse font-display">
                Growing your data...
            </p>
        </div>
    )
}

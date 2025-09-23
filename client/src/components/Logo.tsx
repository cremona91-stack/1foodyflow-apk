interface LogoProps {
  className?: string;
  surface?: "background" | "card";
}

export default function Logo({ className = "h-12 w-auto", surface = "card" }: LogoProps) {
  const backgroundFill = surface === "card" ? "hsl(var(--card))" : "hsl(var(--background))";
  
  return (
    <svg 
      viewBox="0 0 200 200" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="FoodyFlow logo"
      data-testid="img-logo"
    >
      {/* Cerchio principale con sfondo che si adatta al tema */}
      <circle
        cx="100"
        cy="100"
        r="95"
        fill={backgroundFill}
        fillOpacity="0.8"
        stroke="hsl(var(--foreground))"
        strokeWidth="2"
      />
      
      {/* Cerchio interno per profondità */}
      <circle
        cx="100"
        cy="100"
        r="88"
        fill="none"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="1"
        strokeOpacity="0.3"
      />
      
      {/* Nuvola sopra "fw" */}
      <g transform="translate(100, 60)">
        <path
          d="M-8,-8 Q-12,-12 -6,-12 Q-2,-16 2,-12 Q8,-16 12,-12 Q16,-8 12,-4 Q8,-2 4,-4 Q0,-2 -4,-4 Q-8,-2 -8,-8"
          fill="none"
          stroke="hsl(var(--card-foreground))"
          strokeWidth="1.5"
          strokeOpacity="0.7"
        />
      </g>
      
      {/* Scritta "fw" corsiva elegante */}
      <g transform="translate(100, 85)">
        <path
          d="M-15,0 Q-15,-8 -10,-8 Q-5,-8 -5,-4 Q-5,0 -10,4 Q-8,4 -5,0 Q-2,-4 2,-4 Q6,-4 6,0 Q6,4 2,8 M6,0 Q10,-4 15,-4 Q20,-4 20,0 Q20,4 15,8 Q12,8 10,4"
          fill="none"
          stroke="hsl(var(--card-foreground))"
          strokeWidth="2"
          strokeOpacity="0.8"
        />
      </g>
      
      {/* Testo FoodyFlow */}
      <text
        x="100"
        y="130"
        textAnchor="middle"
        fill="hsl(var(--card-foreground))"
        fontSize="18"
        fontFamily="Inter, sans-serif"
        fontWeight="700"
      >
        FoodyFlow
      </text>
      
      {/* Sottotitolo */}
      <text
        x="100"
        y="150"
        textAnchor="middle"
        fill="hsl(var(--muted-foreground))"
        fontSize="10"
        fontFamily="Inter, sans-serif"
        fontStyle="italic"
      >
        Evolve Your Eatery
      </text>
      
      {/* Elementi decorativi che rappresentano il "flow" */}
      <g>
        <path
          d="M60,120 Q80,110 90,120"
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth="1"
          strokeOpacity="0.3"
        />
        <path
          d="M110,120 Q120,110 140,120"
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth="1"
          strokeOpacity="0.3"
        />
      </g>
    </svg>
  );
}
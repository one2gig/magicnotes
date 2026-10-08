import { environmentById, type EnvironmentId } from "../config/themes";

interface EnvironmentBackdropProps {
  id: EnvironmentId;
}

export function EnvironmentBackdrop({ id }: EnvironmentBackdropProps) {
  const environment = environmentById(id);
  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        className="absolute inset-0 bg-cover bg-center transition-[background-image] duration-700"
        style={{ backgroundImage: `url(${environment.image})` }}
      />
      <div className={`absolute inset-0 bg-gradient-to-b ${environment.wash}`} />
      <Ambient id={id} />
    </div>
  );
}

function Ambient({ id }: { id: EnvironmentId }) {
  if (id === "rain") {
    return (
      <div className="rainfall absolute inset-x-0 -top-8 h-[120%] opacity-40">
        {Array.from({ length: 18 }, (_, index) => (
          <span
            key={index}
            className="absolute h-8 w-px bg-white/50"
            style={{ left: `${(index * 37) % 100}%`, top: `${(index * 17) % 90}%` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      {Array.from({ length: 16 }, (_, index) => (
        <span
          key={index}
          className={`absolute size-1.5 rounded-full ${id === "forest" ? "bg-gold drift" : "bg-white twinkle"}`}
          style={{
            left: `${(index * 19) % 100}%`,
            top: `${(index * 29) % 100}%`,
            animationDelay: `${index * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

import { Button } from "../common/Button";
import { useArchitectureStore } from "../../store/architecture-store";
import { useSimulationStore } from "../../store/simulation-store";
import { getScenarioDuration } from "../../domain/simulation/scenarios";
import { formatSeconds } from "../../utils/format";
import { SIMULATION_SPEEDS } from "../../store/simulation-store";

export function TimelineBar() {
  const architectureA = useArchitectureStore((state) => state.architectureA);
  const architectureB = useArchitectureStore((state) => state.architectureB);
  const isPlaying = useSimulationStore((state) => state.isPlaying);
  const currentTime = useSimulationStore((state) => state.currentTime);
  const speed = useSimulationStore((state) => state.speed);
  const scenario = useSimulationStore((state) => state.scenario);
  const play = useSimulationStore((state) => state.play);
  const pause = useSimulationStore((state) => state.pause);
  const restart = useSimulationStore((state) => state.restart);
  const seek = useSimulationStore((state) => state.seek);
  const setSpeed = useSimulationStore((state) => state.setSpeed);
  const duration = getScenarioDuration(scenario);
  const progress = duration === 0 ? 0 : currentTime / duration;

  return (
    <footer className="border-t border-slate-800 bg-slate-950/95 px-4 py-3">
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <Button variant="primary" onClick={() => (isPlaying ? pause() : play())}>
          {isPlaying ? "Pause" : "Play"}
        </Button>
        <Button onClick={() => restart(architectureA, architectureB)}>Restart</Button>
        <div className="flex items-center gap-1">
          {SIMULATION_SPEEDS.map((value) => (
            <Button key={value} variant={speed === value ? "primary" : "ghost"} onClick={() => setSpeed(value)}>
              {value}x
            </Button>
          ))}
        </div>
        <p className="ml-auto font-mono text-sm text-slate-300">
          {formatSeconds(currentTime)} / {formatSeconds(duration)} · {scenario.name}
        </p>
      </div>
      <div className="relative h-8">
        <input
          aria-label="Simulation timeline"
          type="range"
          min={0}
          max={duration}
          step={0.1}
          value={currentTime}
          onChange={(event) => seek(Number(event.target.value), architectureA, architectureB)}
          className="absolute inset-0 z-10 h-8 w-full cursor-pointer appearance-none bg-transparent"
        />
        <div className="absolute inset-y-3 left-0 right-0 rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-cyan-400" style={{ width: `${progress * 100}%` }} />
          <div
            className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-cyan-200 bg-cyan-400"
            style={{ left: `calc(${progress * 100}% - 8px)` }}
          />
        </div>
      </div>
    </footer>
  );
}

import { getProgressBarStatus } from "../../utils/getProgressBarStatus";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";

interface CircleProgressBar {
  percentage: number;
}

const CircleProgressBar = ({ percentage }: CircleProgressBar) => {
  const { color, status } = getProgressBarStatus(percentage);

  return (
    <div className="flex items-center">
      <CircularProgressbarWithChildren
        strokeWidth={6}
        minValue={0}
        maxValue={100}
        value={percentage}
        circleRatio={0.75}
        styles={buildStyles({
          rotation: 1 / 2 + 1 / 8,
          strokeLinecap: "round",
          trailColor: "#eee",
          pathColor: `${percentage > 100 ? "unset" : color}`,
        })}
      >
        {typeof percentage === "undefined" ? (
          <div className="animate-pulse">
            <div className="rounded-full bg-gray-400 w-20 h-12 " />
            <div className="rounded-full bg-gray-400 my-4 w-20 h-4 " />
            <div className="rounded-full bg-gray-400 w-20 h-10 " />
          </div>
        ) : (
          <>
            <div style={{ color: color }} className="text-5xl leading-10">
              {percentage === 0 || percentage > 100 ? "-" : percentage}
            </div>
            <div className="text-[#6A707F] text-sm py-4">Health Score</div>
            <div
              style={{ backgroundColor: color }}
              className="px-4 py-2 tracking-widest rounded-full text-white text-base"
            >
              {percentage === 0 || percentage > 100 ? "-" : status}
            </div>
          </>
        )}
      </CircularProgressbarWithChildren>
    </div>
  );
};

export default CircleProgressBar;

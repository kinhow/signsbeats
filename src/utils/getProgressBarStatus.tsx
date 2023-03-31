export function getProgressBarStatus(percentage: number) {
  let color = "",
    status = "";

  if (percentage === 0 || percentage > 100) {
    color = "#E1E2E5";
    status = "-";
  }
  if (percentage > 0 && percentage <= 30) {
    color = "#F05F6B";
    status = "Stress";
  }
  if (percentage > 30 && percentage <= 60) {
    color = "#FAA519";
    status = "Mild Stress";
  }
  if (percentage > 60 && percentage <= 100) {
    color = "#0EAD90";
    status = "Recovery";
  }

  return { color, status };
}

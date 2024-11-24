import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { HTMLAttributes } from "react";

type DeploymentStatusIndicatorProps = {
  isDeployed: boolean;
  showCheckIcon?: boolean;
};

const DeploymentStatusIndicator = ({
  isDeployed,
  showCheckIcon = false,
  className,
  ...props
}: DeploymentStatusIndicatorProps & HTMLAttributes<HTMLDivElement>) => {
  const displayCheckIcon = isDeployed && showCheckIcon;

  const indicatorBackgroundColor = isDeployed
    ? displayCheckIcon
      ? "#FFF"
      : "bg-bg-surface-success"
    : "bg-bg-surface-warning";

  return (
    <div className={`w-4 h-4 rounded-full ${indicatorBackgroundColor} ${className}`} {...props}>
      {displayCheckIcon && <CheckCircleIcon className="fill-demo-surface-success w-4 h-4" />}
    </div>
  );
};

export { DeploymentStatusIndicator };

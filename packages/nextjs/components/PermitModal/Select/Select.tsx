import { useFhenixAllPermits } from "~~/permits/hooks";

export const PermitV2ModalSelect = () => {
  // List of permits
  // If active permit selected, highlight at top
  // Each permit row has buttons <expand, use>
  // Expand opens sub page with action buttons <back, use>

  const permits = useFhenixAllPermits();

  console.log({ permits });

  return <>List of permits</>;
};

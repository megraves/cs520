import { Button } from "@heroui/button";

type Props = {
  icon: string;
  onAction: () => void;
};

export default function IconButton({ icon, onAction }: Props) {
  return (
      <Button
        isIconOnly
        radius="full"
        color="secondary"
        onPress={onAction}
      >
        <i className={`${icon}`}></i>
      </Button>
  );
}
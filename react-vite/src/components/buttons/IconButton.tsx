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
        color="primary"
        onPress={onAction}
        variant="solid"
      >
        <i className={`${icon}`}></i>
      </Button>
  );
}
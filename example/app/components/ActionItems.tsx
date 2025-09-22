import {
  Check,
  Check as CheckIconRaw,
  ChevronDown as ChevronDownRaw,
  ChevronUp as ChevronUpRaw,
} from "@tamagui/lucide-icons";
import * as React from "react";
import { Adapt, Button, Checkbox, Label, Select, Sheet, Switch, XStack, YStack } from "tamagui";

type IconProps = {
  size?: number;
  color?: string;
};

const ChevronDownIcon = ChevronDownRaw as React.ComponentType<IconProps>;
const ChevronUpIcon = ChevronUpRaw as React.ComponentType<IconProps>;
const CheckIcon = CheckIconRaw as React.ComponentType<IconProps>;
const CheckIconMinimal = Check as React.ComponentType<IconProps>;
import { LinearGradient } from "tamagui/linear-gradient";

interface SwitchActionItemProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export const CustomSwitchActionItem: React.FC<SwitchActionItemProps> = ({
  label,
  value,
  onValueChange,
}) => {
  return (
    <XStack justifyContent="space-between" alignItems="center">
      <Label fontSize={"$4"}>{label}</Label>
      <Switch size="$2" checked={value} onCheckedChange={onValueChange}>
        <Switch.Thumb animation="quicker" />
      </Switch>
    </XStack>
  );
};

interface CustomActionItemProps {
  label: string;
  action: () => void;
  activated: boolean;
}

export const CustomCheckboxActionItem: React.FC<CustomActionItemProps> = ({
  label,
  action,
  activated,
}) => {
  return (
    <XStack justifyContent="space-between" alignItems="center">
      <Label fontSize={"$4"}>{label}</Label>
      <XStack paddingHorizontal={"$3"}>
        <Checkbox onPress={action} checked={activated}>
          <Checkbox.Indicator>
            <CheckIcon />
          </Checkbox.Indicator>
        </Checkbox>
      </XStack>
    </XStack>
  );
};

interface ButtonActionItemProps {
  label: string;
  action: () => void;
}

export const CustomButtonActionItem: React.FC<ButtonActionItemProps> = ({ label, action }) => (
  <Button themeInverse onPress={action}>
    {label}
  </Button>
);

interface SelectActionItemProps {
  options: { label: string; value: string }[];
  value: string;
  onValueChange: (value: string) => void;
  label: string;
}

export const CustomSelectActionItem: React.FC<SelectActionItemProps> = ({
  options,
  value,
  onValueChange,
  label,
}) => {
  return (
    <XStack justifyContent="space-between" alignItems="center">
      <Label fontSize={"$4"}>{label}</Label>
      <Select value={value} onValueChange={onValueChange} disablePreventBodyScroll>
        <Select.Trigger width={"auto"} iconAfter={<ChevronDownIcon />}>
          <Select.Value placeholder="Something" />
        </Select.Trigger>

        <Adapt when="sm" platform="touch">
          <Sheet
            modal
            dismissOnSnapToBottom
            animationConfig={{
              type: "spring",
              damping: 20,
              mass: 1.2,
              stiffness: 250,
            }}
          >
            <Sheet.Frame>
              <Sheet.ScrollView>
                <Adapt.Contents />
              </Sheet.ScrollView>
            </Sheet.Frame>
            <Sheet.Overlay
              animation="lazy"
              enterStyle={{ opacity: 0 }}
              exitStyle={{ opacity: 0 }}
            />
          </Sheet>
        </Adapt>

        <Select.Content zIndex={200000}>
          <Select.ScrollUpButton
            alignItems="center"
            justifyContent="center"
            position="relative"
            width="100%"
            height="$3"
          >
            <YStack zIndex={10}>
              <ChevronUpIcon size={20} />
            </YStack>
            <LinearGradient
              start={[0, 0]}
              end={[0, 1]}
              fullscreen
              colors={["$background", "transparent"]}
              borderRadius="$4"
            />
          </Select.ScrollUpButton>

          <Select.Viewport minWidth={200}>
            <Select.Group>
              <Select.Label>{label}</Select.Label>
              {React.useMemo(
                () =>
                  options.map((item, i) => {
                    return (
                      <Select.Item index={i} key={item.value} value={item.value.toLowerCase()}>
                        <Select.ItemText>{item.label}</Select.ItemText>
                        <Select.ItemIndicator marginLeft="auto">
                          <CheckIconMinimal size={16} />
                        </Select.ItemIndicator>
                      </Select.Item>
                    );
                  }),
                [options]
              )}
            </Select.Group>
          </Select.Viewport>

          <Select.ScrollDownButton
            alignItems="center"
            justifyContent="center"
            position="relative"
            width="100%"
            height="$3"
          >
            <YStack zIndex={10}>
              <ChevronDownIcon size={20} />
            </YStack>
            <LinearGradient
              start={[0, 0]}
              end={[0, 1]}
              fullscreen
              colors={["transparent", "$background"]}
              borderRadius="$4"
            />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select>
    </XStack>
  );
};

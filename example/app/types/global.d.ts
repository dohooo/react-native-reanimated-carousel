import "react-native";

declare module "react-native" {
  interface ViewProps {
    dataSet?: {
      [key: string]: string;
    };
  }
}

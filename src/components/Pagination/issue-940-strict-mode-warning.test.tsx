import { useSharedValue } from "react-native-reanimated";

import { render } from "@testing-library/react-native";

import { Pagination } from ".";

const STRICT_RENDER_READ_WARNING = "Reading from `value` during component render";

type LoggerData = { level: number; message: string };
type LoggerConfig = { logFunction: (data: LoggerData) => void };

const loggerConfig = (global as unknown as { __reanimatedLoggerConfig?: LoggerConfig })
  .__reanimatedLoggerConfig;

if (!loggerConfig) {
  throw new Error(
    "Expected reanimated logger config to be installed by setUpTests(); cannot capture strict mode warnings."
  );
}

const capturedMessages: string[] = [];
let originalLogFunction: LoggerConfig["logFunction"];

beforeEach(() => {
  jest.useFakeTimers();
  capturedMessages.length = 0;
  originalLogFunction = loggerConfig.logFunction;
  loggerConfig.logFunction = (data) => {
    capturedMessages.push(data.message);
  };
});

afterEach(() => {
  loggerConfig.logFunction = originalLogFunction;
  jest.useRealTimers();
});

function strictRenderReadWarnings() {
  return capturedMessages.filter((message) => message.includes(STRICT_RENDER_READ_WARNING));
}

function PaginationHarness(_props: { tick: number }) {
  const progress = useSharedValue(0);
  return <Pagination count={3} progress={progress} />;
}

describe("issue #940 Pagination strict mode warning", () => {
  it("control: first render alone does not warn (Reanimated exempts the first render)", () => {
    render(<PaginationHarness tick={0} />);

    expect(strictRenderReadWarnings()).toEqual([]);
  });

  it("does not read progress.value during component render (initial + re-render)", () => {
    const screen = render(<PaginationHarness tick={0} />);

    // A parent-driven re-render is enough: the `useState` initializer
    // expression is re-evaluated on every render (React only ignores the
    // result), and reads outside the first render are not exempt from
    // Reanimated's strict mode check.
    screen.rerender(<PaginationHarness tick={1} />);

    expect(strictRenderReadWarnings()).toEqual([]);
  });
});

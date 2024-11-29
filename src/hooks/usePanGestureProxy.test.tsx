import React from "react";
import { Text } from "react-native";
import type { PanGesture, PanGestureHandler, TapGesture } from "react-native-gesture-handler";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  State,
} from "react-native-gesture-handler";

import { cleanup, render } from "@testing-library/react-native";
import { fireGestureHandler, getByGestureTestId } from "react-native-gesture-handler/jest-utils";

import { usePanGestureProxy } from "./usePanGestureProxy";

beforeEach(cleanup);

const mockedEventHandlers = () => {
  return {
    begin: jest.fn(),
    start: jest.fn(),
    active: jest.fn(),
    end: jest.fn(),
    fail: jest.fn(),
    cancel: jest.fn(),
    finish: jest.fn(),
  };
};

const mockedEventHandlersFromUser = () => {
  return {
    begin: jest.fn(),
    start: jest.fn(),
    active: jest.fn(),
    end: jest.fn(),
    fail: jest.fn(),
    cancel: jest.fn(),
    finish: jest.fn(),
  };
};

describe("Using RNGH v2 gesture API", () => {
  interface SingleHandlerProps {
    handlers: ReturnType<typeof mockedEventHandlers>;
    handlersFromUser: ReturnType<typeof mockedEventHandlers>;
    treatStartAsUpdate?: boolean;
  }

  function SingleHandler({ handlers, handlersFromUser, treatStartAsUpdate }: SingleHandlerProps) {
    const pan = usePanGestureProxy({
      onConfigurePanGesture: (gesture: PanGesture) => {
        // This is user's customizations
        gesture
          .onBegin(handlersFromUser.begin)
          .onUpdate(handlersFromUser.active)
          .onEnd(handlersFromUser.end)
          .onFinalize(handlers.finish)
          .withTestId("pan");
      },
      onGestureStart: treatStartAsUpdate ? handlers.active : handlers.start,
      onGestureUpdate: handlers.active,
      onGestureEnd: handlers.end,
      options: { enabled: true },
    });

    return (
      <GestureHandlerRootView>
        <GestureDetector gesture={pan}>
          <Text>v2 API test</Text>
        </GestureDetector>
      </GestureHandlerRootView>
    );
  }

  interface RacingHandlersProps {
    tapHandlers: ReturnType<typeof mockedEventHandlers>;
    panHandlers: ReturnType<typeof mockedEventHandlers>;
  }

  function RacingHandlers({ tapHandlers, panHandlers }: RacingHandlersProps) {
    const tap = Gesture.Tap().onBegin(tapHandlers.begin).onEnd(tapHandlers.end).withTestId("tap");

    const pan = usePanGestureProxy({
      onConfigurePanGesture: (_: PanGesture) => {
        _.onBegin(panHandlers.begin).onFinalize(panHandlers.finish).withTestId("pan");
      },
      onGestureStart: panHandlers.start,
      onGestureUpdate: panHandlers.active,
      onGestureEnd: panHandlers.end,
      options: { enabled: true },
    });

    return (
      <GestureHandlerRootView>
        <GestureDetector gesture={Gesture.Race(tap, pan)}>
          <Text>v2 API test</Text>
        </GestureDetector>
      </GestureHandlerRootView>
    );
  }

  it("sends events to handlers", () => {
    const tapHandlers = mockedEventHandlers();
    const panHandlers = mockedEventHandlers();
    render(<RacingHandlers tapHandlers={tapHandlers} panHandlers={panHandlers} />);

    fireGestureHandler<PanGesture>(getByGestureTestId("pan"), [
      { state: State.BEGAN },
      { state: State.ACTIVE },
      { state: State.END },
    ]);
    expect(panHandlers.begin).toBeCalledWith(expect.objectContaining({ state: State.BEGAN }));
    expect(panHandlers.finish).toBeCalled();
    expect(tapHandlers.begin).not.toBeCalled();
  });

  it("sends events with additional data to handlers", () => {
    const panHandlers = mockedEventHandlers();
    const panHandlersFromUser = mockedEventHandlersFromUser();
    render(
      <SingleHandler
        handlers={panHandlers}
        handlersFromUser={panHandlersFromUser}
        treatStartAsUpdate
      />
    );
    fireGestureHandler<PanGesture>(getByGestureTestId("pan"), [
      { state: State.BEGAN, translationX: 0 },
      { state: State.ACTIVE, translationX: 10 },
      { translationX: 20 },
      { translationX: 20 },
      { state: State.END, translationX: 30 },
    ]);

    expect(panHandlersFromUser.begin).toBeCalledTimes(1);
    expect(panHandlersFromUser.active).toBeCalledTimes(2);
    expect(panHandlersFromUser.end).toBeCalledTimes(1);

    expect(panHandlers.active).toBeCalledTimes(3);
    expect(panHandlers.active).toHaveBeenLastCalledWith(
      expect.objectContaining({ translationX: 20 })
    );
  });

  it("does not include console.error in the output", () => {
    // if react-native-gesture-handler detects that some handlers are
    // workletized and some are not, it will log an error to the
    // console. We'd like to make sure that this doesn't happen.

    // The error that would be shown looks like:
    // [react-native-gesture-handler] Some of the callbacks in the gesture are worklets and some are not. Either make sure that all calbacks are marked as 'worklet' if you wish to run them on the UI thread or use '.runOnJS(true)' modifier on the gesture explicitly to run all callbacks on the JS thread.

    const panHandlers = mockedEventHandlers();
    const panHandlersFromUser = mockedEventHandlersFromUser();

    jest.spyOn(console, "error");

    render(
      <SingleHandler
        handlers={panHandlers}
        handlersFromUser={panHandlersFromUser}
        treatStartAsUpdate
      />
    );
    fireGestureHandler<PanGesture>(getByGestureTestId("pan"), [
      { state: State.BEGAN },
      { state: State.ACTIVE },
      { state: State.END },
    ]);

    expect(console.error).not.toBeCalled();
  });
});

describe("Event list validation", () => {
  interface SingleHandlerProps {
    handlers: ReturnType<typeof mockedEventHandlers>;
    handlersFromUser: ReturnType<typeof mockedEventHandlers>;
    treatStartAsUpdate?: boolean;
  }

  function SingleHandler({ handlers, handlersFromUser, treatStartAsUpdate }: SingleHandlerProps) {
    const pan = usePanGestureProxy({
      onConfigurePanGesture: (_: PanGesture) => {
        _.onBegin(handlersFromUser.begin)
          .onUpdate(handlersFromUser.active)
          .onEnd(handlersFromUser.end)
          .onFinalize(handlers.finish)
          .withTestId("pan");
      },
      onGestureStart: treatStartAsUpdate ? handlers.active : handlers.start,
      onGestureUpdate: handlers.active,
      onGestureEnd: handlers.end,
      options: { enabled: true },
    });

    return (
      <GestureHandlerRootView>
        <GestureDetector gesture={pan}>
          <Text>v2 API test</Text>
        </GestureDetector>
      </GestureHandlerRootView>
    );
  }

  it("throws error when oldState doesn't correspond to previous event's state", () => {
    const panHandlers = mockedEventHandlers();
    const panHandlersFromUser = mockedEventHandlersFromUser();
    render(<SingleHandler handlers={panHandlers} handlersFromUser={panHandlersFromUser} />);

    expect(() => {
      fireGestureHandler<PanGesture>(getByGestureTestId("pan"), [
        { oldState: State.UNDETERMINED, state: State.BEGAN, x: 0, y: 10 },
        { oldState: State.UNDETERMINED, state: State.ACTIVE, x: 1, y: 11 },
      ]);
    }).toThrow("when state changes, oldState should be the same as previous event' state");
  });

  it.each([[State.END], [State.FAILED], [State.CANCELLED]])(
    "correctly handles events ending with state %s",
    (lastState) => {
      const panHandlers = mockedEventHandlers();
      const panHandlersFromUser = mockedEventHandlersFromUser();
      render(<SingleHandler handlers={panHandlers} handlersFromUser={panHandlersFromUser} />);
      fireGestureHandler<PanGesture>(getByGestureTestId("pan"), [
        { state: State.BEGAN },
        { state: State.ACTIVE },
        { state: lastState },
      ]);

      expect(panHandlersFromUser.begin).toBeCalledTimes(1);
      expect(panHandlersFromUser.active).toBeCalledTimes(0);
      expect(panHandlersFromUser.end).toBeCalledTimes(1);

      if (lastState === State.END) expect(panHandlers.end).toBeCalled();
      else expect(panHandlers.finish).toBeCalledWith(expect.any(Object), false);
    }
  );
});

describe("Filling event list with defaults", () => {
  interface RacingTapAndPanProps {
    handlers: ReturnType<typeof mockedEventHandlers>;
    treatStartAsUpdate?: boolean;
  }

  function RacingTapAndPan({ handlers, treatStartAsUpdate }: RacingTapAndPanProps) {
    const tap = Gesture.Tap().onBegin(handlers.begin).onEnd(handlers.end).withTestId("tap");

    const pan = usePanGestureProxy({
      onConfigurePanGesture: (_: PanGesture) => {
        _.onBegin(handlers.begin).onFinalize(handlers.finish).withTestId("pan");
      },
      onGestureStart: treatStartAsUpdate ? handlers.active : handlers.start,
      onGestureUpdate: handlers.active,
      onGestureEnd: handlers.end,
      options: { enabled: true },
    });

    return (
      <GestureHandlerRootView>
        <GestureDetector gesture={Gesture.Exclusive(pan, tap)}>
          <Text>v2 API test</Text>
        </GestureDetector>
      </GestureHandlerRootView>
    );
  }

  it("fills oldState if not passed", () => {
    const handlers = mockedEventHandlers();
    render(<RacingTapAndPan handlers={handlers} treatStartAsUpdate />);
    fireGestureHandler<PanGestureHandler>(getByGestureTestId("pan"), [
      { state: State.BEGAN },
      { state: State.ACTIVE },
      { state: State.ACTIVE },
      { state: State.ACTIVE },
      { state: State.END },
    ]);

    expect(handlers.begin).toBeCalledWith(
      expect.objectContaining({ oldState: State.UNDETERMINED })
    );
    expect(handlers.active).nthCalledWith(1, expect.objectContaining({ oldState: State.BEGAN }));
    expect(handlers.active).lastCalledWith(
      expect.not.objectContaining({ oldState: expect.anything() })
    );
    expect(handlers.end).toBeCalledWith(expect.objectContaining({ oldState: State.ACTIVE }), true);
  });

  it("fills missing ACTIVE states", () => {
    const panHandlers = mockedEventHandlers();
    render(<RacingTapAndPan handlers={panHandlers} treatStartAsUpdate />);
    fireGestureHandler<PanGesture>(getByGestureTestId("pan"), [
      { state: State.BEGAN, x: 0, y: 10 },
      { state: State.ACTIVE, x: 1, y: 11 },
      { x: 2, y: 12 },
      { x: 3, y: 13 },
      { state: State.END, x: 4, y: 14 },
    ]);

    expect(panHandlers.active).toBeCalledTimes(3);
    expect(panHandlers.active).toHaveBeenLastCalledWith(expect.objectContaining({ x: 3, y: 13 }));
  });

  it("fills BEGIN and END events for discrete handlers", () => {
    const handlers = mockedEventHandlers();
    render(<RacingTapAndPan handlers={handlers} treatStartAsUpdate />);
    fireGestureHandler<TapGesture>(getByGestureTestId("tap"), [{ x: 5 }]);
    expect(handlers.begin).toBeCalledTimes(1);
    expect(handlers.end).toBeCalledTimes(1);
  });

  it("with FAILED event, fills BEGIN event for discrete handlers", () => {
    const handlers = mockedEventHandlers();
    render(<RacingTapAndPan handlers={handlers} treatStartAsUpdate />);
    fireGestureHandler<TapGesture>(getByGestureTestId("tap"), [{ state: State.FAILED }]);
    expect(handlers.begin).toBeCalledTimes(1);
    expect(handlers.end).toBeCalledTimes(1);
    expect(handlers.end).toBeCalledWith(expect.anything(), false);
  });

  it("uses event data from first event in filled BEGIN, ACTIVE events", () => {
    const handlers = mockedEventHandlers();
    render(<RacingTapAndPan handlers={handlers} treatStartAsUpdate />);
    fireGestureHandler<PanGesture>(getByGestureTestId("pan"), [{ x: 120 }]);
    expect(handlers.begin).toBeCalledWith(expect.objectContaining({ x: 120 }));
    expect(handlers.active).toHaveBeenNthCalledWith(1, expect.objectContaining({ x: 120 }));
  });

  it("uses event data from last event in filled END events", () => {
    const handlers = mockedEventHandlers();
    render(<RacingTapAndPan handlers={handlers} treatStartAsUpdate />);
    fireGestureHandler<PanGesture>(getByGestureTestId("pan"), [{ x: 120, state: State.FAILED }]);
    expect(handlers.begin).toBeCalledTimes(1);
    expect(handlers.active).toBeCalledTimes(1);
    expect(handlers.end).toBeCalledWith(expect.objectContaining({ x: 120 }), false);
  });

  it("uses event data filled events", () => {
    const handlers = mockedEventHandlers();
    render(<RacingTapAndPan handlers={handlers} treatStartAsUpdate />);
    fireGestureHandler<PanGesture>(getByGestureTestId("pan"), [
      { x: 5, y: 15 },
      { x: 6, y: 16 },
      { x: 7, y: 17 },
    ]);
    expect(handlers.begin).toBeCalledWith(expect.objectContaining({ x: 5, y: 15 }));
    expect(handlers.active).toBeCalledTimes(3);
    expect(handlers.end).toBeCalledWith(expect.objectContaining({ x: 7, y: 17 }), true);
  });

  it("fills BEGIN and END events when they're not present, for discrete handlers", () => {
    const handlers = mockedEventHandlers();
    render(<RacingTapAndPan handlers={handlers} treatStartAsUpdate />);
    fireGestureHandler<TapGesture>(getByGestureTestId("tap"));
    expect(handlers.begin).toBeCalledTimes(1);
    expect(handlers.end).toHaveBeenCalledTimes(1);
  });

  it("fills BEGIN, ACTIVE and END events when they're not present, for continuous handlers", () => {
    const handlers = mockedEventHandlers();
    render(<RacingTapAndPan handlers={handlers} treatStartAsUpdate />);
    fireGestureHandler<PanGesture>(getByGestureTestId("pan"));
    expect(handlers.begin).toBeCalledTimes(1);
    expect(handlers.active).toBeCalledTimes(1);
    expect(handlers.end).toHaveBeenCalledTimes(1);
  });
});

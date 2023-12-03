import { DATA_LENGTH } from "../constants";

const { SINGLE_ITEM, DOUBLE_ITEM } = DATA_LENGTH;

function isAutoFillData(params: { autoFillData: boolean; loop: boolean }) {
  "worklet";
  return !!params.loop && !!params.autoFillData;
}

type BaseParams<T extends object = {}> = {
  autoFillData: boolean
  loop: boolean
} & T;

export function convertToSharedIndex(
  params: BaseParams<{ index: number; rawDataLength: number }>,
) {
  "worklet";
  const { loop, rawDataLength, index, autoFillData } = params;

  if (isAutoFillData({ loop, autoFillData })) {
    switch (rawDataLength) {
      case SINGLE_ITEM:
        return 0;
      case DOUBLE_ITEM:
        return index % 2;
    }
  }

  return index;
}

export function computedOffsetXValueWithAutoFillData(
  params: BaseParams<{
    rawDataLength: number
    value: number
    size: number
  }>,
) {
  "worklet";

  const { rawDataLength, value, size, loop, autoFillData } = params;

  if (isAutoFillData({ loop, autoFillData })) {
    switch (rawDataLength) {
      case SINGLE_ITEM:
        return value % size;
      case DOUBLE_ITEM:
        return value % (size * 2);
    }
  }

  return value;
}

export function computedRealIndexWithAutoFillData(
  params: BaseParams<{
    index: number
    dataLength: number
  }>,
) {
  const { index, dataLength, loop, autoFillData } = params;

  if (isAutoFillData({ loop, autoFillData })) {
    switch (dataLength) {
      case SINGLE_ITEM:
        return index % 1;
      case DOUBLE_ITEM:
        return index % 2;
    }
  }

  return index;
}

export function computedFillDataWithAutoFillData<T>(
  params: BaseParams<{
    data: T[]
    dataLength: number
  }>,
): T[] {
  const { data, loop, autoFillData, dataLength } = params;

  if (isAutoFillData({ loop, autoFillData })) {
    switch (dataLength) {
      case SINGLE_ITEM:
        return [data[0], data[0], data[0]];
      case DOUBLE_ITEM:
        return [data[0], data[1], data[0], data[1]];
    }
  }

  return data;
}

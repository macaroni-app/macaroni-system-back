import Counter from "../models/counters";

const ORDER_REQUEST_COUNTER_KEY = "orderRequest";
const ORDER_REQUEST_CODE_LENGTH = 3;

export const orderRequestCodeService = {
  getNextOrderCode: async (): Promise<string> => {
    const counter = await Counter.findOneAndUpdate(
      { key: ORDER_REQUEST_COUNTER_KEY },
      {
        $inc: { sequence: 1 },
        $setOnInsert: { key: ORDER_REQUEST_COUNTER_KEY },
      },
      {
        upsert: true,
        new: true,
      },
    );

    return String(counter.sequence).padStart(ORDER_REQUEST_CODE_LENGTH, "0");
  },
};

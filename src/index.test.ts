import * as ADT from ".";

const State = ADT.Cases({
  loading: ADT.Case(),
  error: ADT.Case<{ msg: string }>(),
  loaded: ADT.Case<{ n: number; msg: string }>(),
});
type State = ADT.ADT<typeof State>;

describe("ADT", () => {
  test("constructors create objects as specified", () => {
    expect(State.cases.loading({})).toEqual({ _type: "loading" });
    expect(State.cases.error({ msg: "some error" })).toEqual({
      _type: "error",
      msg: "some error",
    });
    expect(State.cases.loaded({ n: 123, msg: "some text" })).toEqual({
      _type: "loaded",
      n: 123,
      msg: "some text",
    });
  });

  test("match chooses appropriate branch", () => {
    const state = State.cases.loaded({ n: 123, msg: "some text" }) as State;
    const result: string = State.match(state, {
      loading: (v) => v._type,
      loaded: (v) => v._type,
      error: (v) => v._type,
    });
    expect(result).toEqual("loaded");
  });

  test("match allows to map to another case", () => {
    const state = State.cases.loaded({ n: 123, msg: "some text" }) as State;
    const result: State = State.match(state, {
      loaded: (v) => State.cases.error({ msg: v.msg }) as State,
      loading: (v) => v,
      error: (v) => ({ ...v, msg: "yet again" }),
    });
    expect(result._type).toEqual("error");
    if (!State.isCase(result, "error")) {
      fail("should be 'error");
    }
    expect(result.msg).toEqual("some text");
  });

  test("isCase allows to filter certains cases", () => {
    const state = State.cases.loaded({ n: 123, msg: "some text" }) as State;

    if (State.isCase(state, "loading")) {
      fail("State is not 'loading'");
    }

    expect(state.msg).toEqual("some text");
  });

  test("isCase allows to filter more then one case", () => {
    const state = State.cases.loaded({ n: 123, msg: "some text" }) as State;

    if (State.isCase(state, "loading", "error")) {
      fail("State is neither 'loading' or 'error");
    }

    expect(state.n).toEqual(123);
  });

  test("match after isCase ignores already matched cases", () => {
    const state = State.cases.loaded({ n: 123, msg: "some text" }) as State;

    if (State.isCase(state, "loading")) {
      fail("State is neither 'loading' or 'error");
    }

    const result: string = State.match(state, {
      loaded: (v) => v._type,
      error: (v) => v._type,
    });
    expect(result).toEqual("loaded");
  });

  test("isCase works with negation", () => {
    const state = State.cases.loaded({ n: 123, msg: "some text" }) as State;

    if (!State.isCase(state, "loaded")) {
      fail("State is neither 'loading' or 'error");
    }

    expect(state.n).toEqual(123);
  });

  test("allCasesCovered helps with switches", () => {
    const state = State.cases.loaded({ n: 123, msg: "some text" }) as State;

    switch (state._type) {
      case "error":
        fail("State is not 'error");
      case "loading":
        fail("State is not 'loading");
      case "loaded":
        expect(state.n).toEqual(123);
        break;
      default:
        State.allCasesCovered(state);
    }
  });
});

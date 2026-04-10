import {
  createEventTitleSchema,
  createEventTypeSchema,
} from "@/lib/validation/createEventSchema";

describe("createEventTitleSchema", () => {
  it("accepts non-empty trimmed title", () => {
    expect(createEventTitleSchema.safeParse("  Hello ").success).toBe(true);
  });

  it("rejects empty or whitespace-only", () => {
    expect(createEventTitleSchema.safeParse("").success).toBe(false);
    expect(createEventTitleSchema.safeParse("   ").success).toBe(false);
  });
});

describe("createEventTypeSchema", () => {
  it("accepts each API event type value", () => {
    expect(createEventTypeSchema.safeParse("BlaBlaRun").success).toBe(true);
    expect(createEventTypeSchema.safeParse("BlaBlaTrail").success).toBe(true);
    expect(createEventTypeSchema.safeParse("TechnicalRun").success).toBe(true);
    expect(createEventTypeSchema.safeParse("TechnicalTrail").success).toBe(true);
  });

  it("rejects unknown strings", () => {
    expect(createEventTypeSchema.safeParse("FunRun").success).toBe(false);
    expect(createEventTypeSchema.safeParse("").success).toBe(false);
  });
});

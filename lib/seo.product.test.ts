import { describe, expect, it } from "vitest";
import { productSeo } from "./seo";

const long =
  "Keep your hairstyle neat and protected throughout the whole night. The long satin bonnet is designed for long, curly, voluminous hair, braids, extensions and styles that need extra room while you sleep.";

describe("productSeo", () => {
  it("uses what the merchant set in EchoDesk as-is", () => {
    const out = productSeo({ name: "X", seoTitle: "Custom title", seoDescription: "Custom description.", locale: "en" });
    expect(out).toEqual({ title: "Custom title", description: "Custom description." });
  });

  it("adds the category to a short name, but not twice", () => {
    expect(productSeo({ name: "Ariel — Wavy Hair, 22″", category: "Hair Extensions", locale: "en" }).title).toBe(
      "Ariel — Wavy Hair, 22″ | Hair Extensions",
    );
    expect(productSeo({ name: "Satin Bonnet", category: "Bonnet", locale: "en" }).title).toBe("Satin Bonnet");
  });

  it("drops the brand suffix rather than let Google cut a long name", () => {
    const name = "4-Piece Satin Hair Bonnets for Women – Hair Protection Caps with Tie, Assorted Colors";
    expect(productSeo({ name, locale: "en" }).title).toEqual({ absolute: name });
  });

  it("ends on a whole sentence with the delivery line, never mid-word", () => {
    const { description } = productSeo({ name: "Bonnet", shortDescription: long, locale: "en" });
    expect(description).toBe(
      "Keep your hairstyle neat and protected throughout the whole night. Delivery across Georgia or free pickup in Tbilisi.",
    );
    expect(description.length).toBeLessThanOrEqual(155);
  });

  it("keeps more of the product's own text when it ends on a whole sentence", () => {
    const text = "Wavy synthetic hair for braiding, about 55 cm long and soft. One pack of 3 pieces covers a full head of braids.";
    expect(productSeo({ name: "Ariel", shortDescription: text, locale: "en" }).description).toBe(text);
  });

  it("writes the delivery line in Georgian on the Georgian page", () => {
    const { description } = productSeo({ name: "ბონეტი", shortDescription: "ატლასის ბონეტი ძილისთვის, რომელიც ამცირებს ხახუნს და ინარჩუნებს თმის ფორმას.", locale: "ka" });
    expect(description).toContain("მიწოდება მთელ საქართველოში ან უფასო გატანა თბილისში.");
  });

  it("still says something useful when the product has no description", () => {
    expect(productSeo({ name: "Durag", locale: "en" }).description).toBe(
      "Durag. Delivery across Georgia or free pickup in Tbilisi.",
    );
  });
});

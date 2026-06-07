with open("src/app/pages/admin/AdminCombo.tsx", "r", encoding="utf-8") as f:
    c = f.read()

# Replace the N+1 load with direct filter
old = """    adminApi
      .listProducts({ size: 100 })
      .then(async (r) => {
        // Fetch detail for each product to check is_combo field
        // (list endpoint doesn't return is_combo)
        const results = await Promise.allSettled(
          r.data.map((p: any) => productApi.get(p.slug)),
        );
        const comboItems: ComboItem[] = [];
        for (const result of results) {
          if (result.status === "fulfilled" && result.value.is_combo) {
            const d = result.value;
            comboItems.push({
              id: d.id,
              name: d.name,
              description: d.description || "",
              image: d.images?.[0] || "",
              price: d.base_price_vnd,
              originalPrice: d.combo_original_price_vnd,
              status: d.status,
            });
          }
        }
        setCombos(comboItems);
      })"""

new = """    adminApi
      .listProducts({ size: 100 })
      .then((r) => {
        setCombos(
          r.data
            .filter((p: any) => p.is_combo)
            .map((p: any) => ({
              id: p.id,
              name: p.name,
              description: p.description || "",
              image: p.images?.[0] || "",
              price: p.base_price_vnd,
              originalPrice: p.combo_original_price_vnd,
              status: p.status,
            })),
        );
      })"""

c = c.replace(old, new)

with open("src/app/pages/admin/AdminCombo.tsx", "w", encoding="utf-8") as f:
    f.write(c)

print("OK")

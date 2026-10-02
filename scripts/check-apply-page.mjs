async function run() {
  const res = await fetch("http://localhost:3000/owerri/apply-vendor");
  const html = await res.text();
  const titleMatches = [...html.matchAll(/class="stall-card__title">([^<]+)<\/h3>/g)].map(m => m[1]);
  const priceMatches = [...html.matchAll(/class="stall-card__price-main">([\s\S]*?)<\/div>/g)].map(m => m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
  const planOptions = [...html.matchAll(/class="plan-option__due-now">([\s\S]*?)<\/div>/g)].map(m => m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
  
  console.log("Stall titles:", titleMatches);
  console.log("Stall prices:", priceMatches);
  console.log("Plan options:", planOptions);
}
run();

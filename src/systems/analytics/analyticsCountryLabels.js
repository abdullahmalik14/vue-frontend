import countryCodesData from '@/config/country-codes.json'

const analyticsCountryCodeToDisplayName = {}
const analyticsCountryCodeToIso3166 = {}

for (const entry of countryCodesData) {
  const numeric = parseInt(entry.numeric, 10)
  const key = `Country ${numeric}`
  analyticsCountryCodeToDisplayName[key] = entry.country
  analyticsCountryCodeToIso3166[key] = entry.alpha2
}

export { analyticsCountryCodeToDisplayName, analyticsCountryCodeToIso3166 }

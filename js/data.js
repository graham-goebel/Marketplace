// Ohio Division of Cannabis Control — Licensed Business Data
// Source: cannabis.ohio.gov | Coordinates are approximate for mapping purposes

const BUSINESSES = [

  // ─────────────────────────────────────────────
  // DISPENSARIES
  // ─────────────────────────────────────────────

  // Columbus Metro
  { id: 1,  name: "Sunnyside* Columbus",          type: "dispensary",  address: "1250 N High St",          city: "Columbus",        zip: "43201", phone: "(614) 929-5533", website: "sunnyside.shop",    lat: 39.9942, lng: -83.0052 },
  { id: 2,  name: "Verilife Worthington",          type: "dispensary",  address: "6555 N High St",          city: "Worthington",     zip: "43085", phone: "",               website: "verilife.com",       lat: 40.0889, lng: -82.9735 },
  { id: 3,  name: "The Botanist Columbus",         type: "dispensary",  address: "1740 Williams Rd",        city: "Columbus",        zip: "43207", phone: "",               website: "thebotanist.com",   lat: 39.9044, lng: -82.9612 },
  { id: 4,  name: "Curaleaf Columbus",             type: "dispensary",  address: "888 E Broad St",          city: "Columbus",        zip: "43205", phone: "",               website: "curaleaf.com",       lat: 39.9596, lng: -82.9836 },
  { id: 5,  name: "Terrasana Columbus",            type: "dispensary",  address: "2401 N High St",          city: "Columbus",        zip: "43202", phone: "",               website: "terrasana.com",      lat: 40.0197, lng: -83.0060 },
  { id: 6,  name: "Bloom Medicinals Columbus",     type: "dispensary",  address: "5765 W Dublin Granville", city: "Columbus",        zip: "43017", phone: "",               website: "bloommedicinals.com",lat: 40.1193, lng: -83.1012 },
  { id: 7,  name: "Fire Rock Columbus",            type: "dispensary",  address: "4040 Graceland Blvd",     city: "Columbus",        zip: "43214", phone: "",               website: "firerockdispensary.com", lat: 40.0513, lng: -82.9836 },
  { id: 8,  name: "Zen Leaf Columbus",             type: "dispensary",  address: "3800 E Broad St",         city: "Columbus",        zip: "43213", phone: "",               website: "zenleaf.com",        lat: 39.9602, lng: -82.9348 },
  { id: 9,  name: "Amplify Life Groveport",        type: "dispensary",  address: "5100 Hendron Rd",         city: "Groveport",       zip: "43125", phone: "",               website: "amplifylifedispensary.com", lat: 39.8571, lng: -82.8926 },
  { id: 10, name: "Select Co-op Columbus",         type: "dispensary",  address: "1655 Old Leonard Ave",    city: "Columbus",        zip: "43219", phone: "",               website: "selectcoop.com",    lat: 39.9832, lng: -82.9419 },

  // Cleveland Metro
  { id: 11, name: "Sunnyside* Cleveland",          type: "dispensary",  address: "3842 E 116th St",         city: "Cleveland",       zip: "44105", phone: "",               website: "sunnyside.shop",    lat: 41.4884, lng: -81.6701 },
  { id: 12, name: "Buckeye Relief Eastlake",       type: "dispensary",  address: "920 E 222nd St",          city: "Euclid",          zip: "44123", phone: "",               website: "buckeyerelief.com", lat: 41.5974, lng: -81.5199 },
  { id: 13, name: "The Botanist Wickliffe",        type: "dispensary",  address: "30300 Euclid Ave",        city: "Wickliffe",       zip: "44092", phone: "",               website: "thebotanist.com",   lat: 41.6063, lng: -81.4676 },
  { id: 14, name: "Terrasana Cleveland",           type: "dispensary",  address: "2052 W 25th St",          city: "Cleveland",       zip: "44113", phone: "",               website: "terrasana.com",     lat: 41.4811, lng: -81.7322 },
  { id: 15, name: "Standard Wellness Cleveland",   type: "dispensary",  address: "3800 Superior Ave",       city: "Cleveland",       zip: "44114", phone: "",               website: "standardwellness.com", lat: 41.5076, lng: -81.6695 },
  { id: 16, name: "Bloom Medicinals Euclid",       type: "dispensary",  address: "22300 Lake Shore Blvd",   city: "Euclid",          zip: "44123", phone: "",               website: "bloommedicinals.com",lat: 41.5931, lng: -81.5268 },
  { id: 17, name: "Verilife Parma",                type: "dispensary",  address: "8060 State Rd",           city: "Parma",           zip: "44134", phone: "",               website: "verilife.com",       lat: 41.3844, lng: -81.7229 },
  { id: 18, name: "Verilife Mentor",               type: "dispensary",  address: "7751 Mentor Ave",         city: "Mentor",          zip: "44060", phone: "",               website: "verilife.com",       lat: 41.6661, lng: -81.3396 },
  { id: 19, name: "The Botanist Lakewood",         type: "dispensary",  address: "14401 Detroit Ave",       city: "Lakewood",        zip: "44107", phone: "",               website: "thebotanist.com",   lat: 41.4819, lng: -81.7982 },
  { id: 20, name: "Curaleaf Cuyahoga Falls",       type: "dispensary",  address: "3550 Massillon Rd",       city: "Cuyahoga Falls",  zip: "44224", phone: "",               website: "curaleaf.com",       lat: 41.1334, lng: -81.4845 },

  // Cincinnati Metro
  { id: 21, name: "Sunnyside* Cincinnati",         type: "dispensary",  address: "2480 Beechmont Ave",      city: "Cincinnati",      zip: "45230", phone: "",               website: "sunnyside.shop",    lat: 39.0963, lng: -84.4130 },
  { id: 22, name: "Verilife West Chester",         type: "dispensary",  address: "8763 Union Centre Blvd",  city: "West Chester",    zip: "45069", phone: "",               website: "verilife.com",       lat: 39.3612, lng: -84.4072 },
  { id: 23, name: "The Botanist Cincinnati",       type: "dispensary",  address: "6930 Hamilton Ave",       city: "Cincinnati",      zip: "45224", phone: "",               website: "thebotanist.com",   lat: 39.1813, lng: -84.5390 },
  { id: 24, name: "Bloom Medicinals Cincinnati",   type: "dispensary",  address: "11290 Montgomery Rd",     city: "Cincinnati",      zip: "45249", phone: "",               website: "bloommedicinals.com",lat: 39.2130, lng: -84.3750 },
  { id: 25, name: "Cannabist Cincinnati",          type: "dispensary",  address: "5370 Glenway Ave",        city: "Cincinnati",      zip: "45238", phone: "",               website: "cannabistdispensary.com", lat: 39.1299, lng: -84.5600 },
  { id: 26, name: "Greenleaf Apothecaries",        type: "dispensary",  address: "4328 Montgomery Rd",      city: "Cincinnati",      zip: "45212", phone: "",               website: "greenleafapothecaries.com", lat: 39.1484, lng: -84.4340 },

  // Dayton Metro
  { id: 27, name: "Sunnyside* Dayton",             type: "dispensary",  address: "6733 N Dixie Dr",         city: "Dayton",          zip: "45414", phone: "",               website: "sunnyside.shop",    lat: 39.7832, lng: -84.1953 },
  { id: 28, name: "Cannabist Dayton",              type: "dispensary",  address: "2830 S Dixie Dr",         city: "Dayton",          zip: "45409", phone: "",               website: "cannabistdispensary.com", lat: 39.7399, lng: -84.1963 },
  { id: 29, name: "Cannabist Beavercreek",         type: "dispensary",  address: "2370 N Fairfield Rd",     city: "Beavercreek",     zip: "45431", phone: "",               website: "cannabistdispensary.com", lat: 39.7254, lng: -84.0635 },
  { id: 30, name: "Pure Ohio Wellness Dayton",     type: "dispensary",  address: "1000 E Dorothy Ln",       city: "Kettering",       zip: "45419", phone: "",               website: "pureohio.com",      lat: 39.6889, lng: -84.1688 },

  // Toledo Metro
  { id: 31, name: "Sunnyside* Toledo",             type: "dispensary",  address: "5230 Sylvania Ave",       city: "Toledo",          zip: "43623", phone: "",               website: "sunnyside.shop",    lat: 41.6430, lng: -83.6140 },
  { id: 32, name: "Pure Ohio Wellness Toledo",     type: "dispensary",  address: "1520 Woodville Rd",       city: "Toledo",          zip: "43605", phone: "",               website: "pureohio.com",      lat: 41.6528, lng: -83.5379 },
  { id: 33, name: "Terrasana Toledo",              type: "dispensary",  address: "6800 W Central Ave",      city: "Toledo",          zip: "43617", phone: "",               website: "terrasana.com",     lat: 41.6651, lng: -83.6722 },

  // Akron / Canton Metro
  { id: 34, name: "The Botanist Akron",            type: "dispensary",  address: "790 W Exchange St",       city: "Akron",           zip: "44302", phone: "",               website: "thebotanist.com",   lat: 41.0764, lng: -81.5297 },
  { id: 35, name: "Bloom Medicinals Akron",        type: "dispensary",  address: "800 Romig Rd",            city: "Akron",           zip: "44320", phone: "",               website: "bloommedicinals.com",lat: 41.0880, lng: -81.5733 },
  { id: 36, name: "Fire Rock North Canton",        type: "dispensary",  address: "6021 Strip Ave NW",       city: "North Canton",    zip: "44720", phone: "",               website: "firerockdispensary.com", lat: 40.8756, lng: -81.3984 },
  { id: 37, name: "Galenas",                       type: "dispensary",  address: "375 Ghent Rd",            city: "Akron",           zip: "44333", phone: "",               website: "galenas.com",        lat: 41.1142, lng: -81.5566 },

  // Other Ohio Cities
  { id: 38, name: "Pure Ohio Wellness Lima",       type: "dispensary",  address: "2080 Elida Rd",           city: "Lima",            zip: "45805", phone: "",               website: "pureohio.com",      lat: 40.7420, lng: -84.1052 },
  { id: 39, name: "Ohio Provisions Dover",         type: "dispensary",  address: "810 Commerce Dr NW",      city: "Dover",           zip: "44622", phone: "",               website: "ohioprovisions.com", lat: 40.5206, lng: -81.4765 },
  { id: 40, name: "Ohio Provisions Niles",         type: "dispensary",  address: "1055 Youngstown Warren Rd",city: "Niles",          zip: "44446", phone: "",               website: "ohioprovisions.com", lat: 41.1832, lng: -80.7682 },
  { id: 41, name: "Zen Leaf Newark",               type: "dispensary",  address: "1295 N 21st St",          city: "Newark",          zip: "43055", phone: "",               website: "zenleaf.com",        lat: 40.0576, lng: -82.4013 },
  { id: 42, name: "Zen Leaf Youngstown",           type: "dispensary",  address: "7000 Southern Blvd",      city: "Youngstown",      zip: "44512", phone: "",               website: "zenleaf.com",        lat: 41.0440, lng: -80.6713 },
  { id: 43, name: "Riviera Creek Bellefontaine",   type: "dispensary",  address: "1791 S Main St",          city: "Bellefontaine",   zip: "43311", phone: "",               website: "rivieracreek.com",   lat: 40.3606, lng: -83.7596 },
  { id: 44, name: "Grow Ohio Zanesville",          type: "dispensary",  address: "1455 Maple Ave",          city: "Zanesville",      zip: "43701", phone: "",               website: "growohio.com",       lat: 39.9403, lng: -82.0132 },
  { id: 45, name: "Bloom Medicinals Steubenville", type: "dispensary",  address: "4200 Sunset Blvd",        city: "Steubenville",    zip: "43952", phone: "",               website: "bloommedicinals.com",lat: 40.3698, lng: -80.6337 },
  { id: 46, name: "Verilife Hubbard",              type: "dispensary",  address: "73 N Main St",            city: "Hubbard",         zip: "44425", phone: "",               website: "verilife.com",       lat: 41.1567, lng: -80.5692 },
  { id: 47, name: "Standard Wellness Gibsonburg",  type: "dispensary",  address: "525 W Madison St",        city: "Gibsonburg",      zip: "43431", phone: "",               website: "standardwellness.com",lat: 41.3842, lng: -83.3254 },
  { id: 48, name: "Curaleaf Sandusky",             type: "dispensary",  address: "2800 Venice Rd",          city: "Sandusky",        zip: "44870", phone: "",               website: "curaleaf.com",       lat: 41.4473, lng: -82.6752 },
  { id: 49, name: "Sunnyside* Elyria",             type: "dispensary",  address: "450 Cleveland St",        city: "Elyria",          zip: "44035", phone: "",               website: "sunnyside.shop",    lat: 41.3684, lng: -82.1077 },
  { id: 50, name: "Bloom Medicinals Hillsboro",    type: "dispensary",  address: "1020 W Main St",          city: "Hillsboro",       zip: "45133", phone: "",               website: "bloommedicinals.com",lat: 39.2026, lng: -83.6135 },
  { id: 51, name: "The Forest Dispensary",         type: "dispensary",  address: "3800 W Sylvania Ave",     city: "Toledo",          zip: "43613", phone: "",               website: "theforestdispensary.com", lat: 41.6752, lng: -83.6241 },
  { id: 52, name: "Terrasana Springdale",          type: "dispensary",  address: "11645 Princeton Pike",    city: "Springdale",      zip: "45246", phone: "",               website: "terrasana.com",     lat: 39.2877, lng: -84.4793 },

  // ─────────────────────────────────────────────
  // PROCESSORS
  // ─────────────────────────────────────────────

  { id: 53, name: "Buckeye Relief Processing",     type: "processor",   address: "920 E 222nd St",          city: "Euclid",          zip: "44123", phone: "",               website: "buckeyerelief.com", lat: 41.5960, lng: -81.5210 },
  { id: 54, name: "Standard Wellness Ohio",        type: "processor",   address: "525 W Madison St",        city: "Gibsonburg",      zip: "43431", phone: "",               website: "standardwellness.com", lat: 41.3852, lng: -83.3244 },
  { id: 55, name: "Pure Ohio Wellness Processing", type: "processor",   address: "9905 E Bradford Rd",      city: "Bradford",        zip: "45308", phone: "",               website: "pureohio.com",      lat: 40.1320, lng: -84.4302 },
  { id: 56, name: "Ohio Clean Leaf",               type: "processor",   address: "8074 Windham St",         city: "Garrettsville",   zip: "44231", phone: "",               website: "",                  lat: 41.2842, lng: -81.0957 },
  { id: 57, name: "Galenas Processing",            type: "processor",   address: "375 Ghent Rd",            city: "Akron",           zip: "44333", phone: "",               website: "galenas.com",        lat: 41.1152, lng: -81.5576 },
  { id: 58, name: "Grow Ohio Processing",          type: "processor",   address: "1455 Maple Ave",          city: "Zanesville",      zip: "43701", phone: "",               website: "growohio.com",       lat: 39.9413, lng: -82.0122 },
  { id: 59, name: "Riviera Creek Processing",      type: "processor",   address: "1791 S Main St",          city: "Bellefontaine",   zip: "43311", phone: "",               website: "rivieracreek.com",   lat: 40.3616, lng: -83.7586 },
  { id: 60, name: "Lighthouse Sciences",           type: "processor",   address: "5500 New Albany Rd W",    city: "New Albany",      zip: "43054", phone: "",               website: "",                  lat: 40.0839, lng: -82.8032 },
  { id: 61, name: "Columbia Care Ohio Processing", type: "processor",   address: "4000 Industrial Blvd",    city: "Zanesville",      zip: "43701", phone: "",               website: "",                  lat: 39.9450, lng: -82.0200 },
  { id: 62, name: "CannAscend Ohio",               type: "processor",   address: "1160 Brice Rd",           city: "Reynoldsburg",    zip: "43068", phone: "",               website: "",                  lat: 39.9518, lng: -82.7984 },
  { id: 63, name: "Acreage Holdings Ohio",         type: "processor",   address: "1800 Newark Granville Rd",city: "Johnstown",       zip: "43031", phone: "",               website: "",                  lat: 40.1533, lng: -82.6880 },
  { id: 64, name: "Firelands Scientific",          type: "processor",   address: "519 E Perkins Ave",       city: "Sandusky",        zip: "44870", phone: "",               website: "firelandsscientific.com", lat: 41.4442, lng: -82.6893 },
  { id: 65, name: "Harvest Enterprises Ohio",      type: "processor",   address: "3600 Lacon Rd",           city: "Hilliard",        zip: "43026", phone: "",               website: "",                  lat: 40.0335, lng: -83.1559 },
  { id: 66, name: "Gage Cannabis Ohio",            type: "processor",   address: "6350 Commerce Pkwy",      city: "Dublin",          zip: "43017", phone: "",               website: "gagecannabis.com",   lat: 40.0994, lng: -83.1143 },

  // ─────────────────────────────────────────────
  // DISTRIBUTORS
  // ─────────────────────────────────────────────

  { id: 67, name: "Greenleaf Cannabis Distribution", type: "distributor", address: "4200 Lockbourne Rd",   city: "Columbus",        zip: "43207", phone: "",               website: "",                  lat: 39.9012, lng: -82.9601 },
  { id: 68, name: "Buckeye Distribution Services",   type: "distributor", address: "555 Enterprise Dr",    city: "Westerville",     zip: "43081", phone: "",               website: "",                  lat: 40.1271, lng: -82.9281 },
  { id: 69, name: "Ohio Cannabis Logistics",         type: "distributor", address: "7000 Hub Pkwy",        city: "Valley View",     zip: "44125", phone: "",               website: "",                  lat: 41.3782, lng: -81.6301 },
  { id: 70, name: "Midwest Cannabis Transport",      type: "distributor", address: "3400 Spring Grove Ave", city: "Cincinnati",     zip: "45225", phone: "",               website: "",                  lat: 39.1342, lng: -84.5381 },
  { id: 71, name: "Buckeye State Distributors",      type: "distributor", address: "10555 Medallion Dr",   city: "Cincinnati",      zip: "45241", phone: "",               website: "",                  lat: 39.2893, lng: -84.4117 },
  { id: 72, name: "Northern Ohio Cannabis Distrib.", type: "distributor", address: "4820 Glenbrook Rd",    city: "Willoughby",      zip: "44094", phone: "",               website: "",                  lat: 41.6396, lng: -81.4073 },
];

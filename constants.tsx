
import { Category, Product } from './types';

const generateProducts = (): Product[] => {
  const products: Product[] = [];

  const dataset = [
    // 1. SMARTPHONES
    { cat: Category.SMARTPHONES, brand: "Apple", name: "iPhone 15 Pro Max Titanium", price: 1199, img: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800" },
    { cat: Category.SMARTPHONES, brand: "Samsung", name: "Galaxy S24 Ultra 512GB", price: 1299, img: "https://images.unsplash.com/photo-1707064406087-0b6167812739?w=800" },
    { cat: Category.SMARTPHONES, brand: "Google", name: "Pixel 8 Pro 128GB Bay Blue", price: 999, img: "https://images.unsplash.com/photo-1696602359489-09f485750d94?w=800" },
    { cat: Category.SMARTPHONES, brand: "Nothing", name: "Nothing Phone (2) Dark Grey", price: 649, img: "https://images.unsplash.com/photo-1688649102473-099b9d16aa32?w=800" },
    { cat: Category.SMARTPHONES, brand: "OnePlus", name: "OnePlus 12 Flowy Emerald", price: 799, img: "https://images.unsplash.com/photo-1711200383120-f1395c808f9c?w=800" },
    { cat: Category.SMARTPHONES, brand: "Samsung", name: "Galaxy Z Fold 5 Graphite", price: 1799, img: "https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00?w=800" },
    { cat: Category.SMARTPHONES, brand: "Sony", name: "Xperia 1 V 4K OLED Phone", price: 1399, img: "https://images.unsplash.com/photo-1610945661006-4147ecba0660?w=800" },
    { cat: Category.SMARTPHONES, brand: "Apple", name: "iPhone 15 Plus Pink 128GB", price: 899, img: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800" },
    { cat: Category.SMARTPHONES, brand: "Google", name: "Pixel 7a Charcoal Compact", price: 499, img: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800" },
    { cat: Category.SMARTPHONES, brand: "Motorola", name: "Motorola Razr+ Flip 2024", price: 999, img: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800" },

    // 2. LAPTOPS
    { cat: Category.LAPTOPS, brand: "Apple", name: "MacBook Pro 14 M3 Max 36GB", price: 3199, img: "https://images.unsplash.com/photo-1517336714467-d23663d77291?w=800" },
    { cat: Category.LAPTOPS, brand: "Dell", name: "XPS 15 9530 i9 32GB 1TB", price: 2199, img: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800" },
    { cat: Category.LAPTOPS, brand: "HP", name: "Spectre x360 14-inch OLED", price: 1499, img: "https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?w=800" },
    { cat: Category.LAPTOPS, brand: "Lenovo", name: "ThinkPad X1 Carbon Gen 12", price: 1899, img: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800" },
    { cat: Category.LAPTOPS, brand: "Razer", name: "Blade 16 RTX 4090 Gaming", price: 4299, img: "https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=800" },
    { cat: Category.LAPTOPS, brand: "Asus", name: "ROG Zephyrus G16 OLED 2024", price: 2699, img: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800" },
    { cat: Category.LAPTOPS, brand: "Microsoft", name: "Surface Laptop 5 13.5-inch", price: 1299, img: "https://images.unsplash.com/photo-1611186871348-b1ec696e52c9?w=800" },
    { cat: Category.LAPTOPS, brand: "Apple", name: "MacBook Air 15 M3 Space Grey", price: 1499, img: "https://images.unsplash.com/photo-1611186871348-b1ec696e52c9?w=800" },
    { cat: Category.LAPTOPS, brand: "MSI", name: "MSI Raider GE78 HX Gaming", price: 3599, img: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800" },
    { cat: Category.LAPTOPS, brand: "Dell", name: "Alienware m18 R2 Desktop Replacement", price: 2899, img: "https://images.unsplash.com/photo-1580522154071-c6ca47a859ad?w=800" },

    // 3. TABLETS (Accessories)
    { cat: Category.ACCESSORIES, brand: "Apple", name: "iPad Pro 12.9 Liquid Retina XDR", price: 1099, img: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800" },
    { cat: Category.ACCESSORIES, brand: "Samsung", name: "Galaxy Tab S9+ Android Tablet", price: 999, img: "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800" },
    { cat: Category.ACCESSORIES, brand: "Apple", name: "iPad Air 10.9-inch Space Grey", price: 599, img: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800" },
    { cat: Category.ACCESSORIES, brand: "Microsoft", name: "Surface Pro 9 i7 16GB 256GB", price: 1299, img: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800" },
    { cat: Category.ACCESSORIES, brand: "Lenovo", name: "Tab P12 Pro Entertainment Tablet", price: 699, img: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800" },
    { cat: Category.ACCESSORIES, brand: "Amazon", name: "Fire Max 11 Tablet 64GB", price: 229, img: "https://images.unsplash.com/photo-1583573636246-18cb2246697f?w=800" },
    { cat: Category.ACCESSORIES, brand: "Google", name: "Pixel Tablet Hazel with Dock", price: 499, img: "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800" },
    { cat: Category.ACCESSORIES, brand: "Xiaomi", name: "Xiaomi Pad 6S Pro 12.4", price: 549, img: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800" },
    { cat: Category.ACCESSORIES, brand: "Apple", name: "iPad Mini 6th Gen 64GB Purple", price: 499, img: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800" },
    { cat: Category.ACCESSORIES, brand: "Samsung", name: "Galaxy Tab A9+ Budget Friendly", price: 219, img: "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800" },

    // 4. HEADPHONES
    { cat: Category.HEADPHONES, brand: "Sony", name: "WH-1000XM5 Noise Cancelling Silver", price: 349, img: "https://images.unsplash.com/photo-1618366712277-70ac3700078b?w=800" },
    { cat: Category.HEADPHONES, brand: "Bose", name: "QuietComfort Ultra Over-Ear White", price: 429, img: "https://images.unsplash.com/photo-1505740420928-5c5597c6d9a0?w=800" },
    { cat: Category.HEADPHONES, brand: "Apple", name: "AirPods Pro 2nd Gen USB-C ANC", price: 249, img: "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800" },
    { cat: Category.HEADPHONES, brand: "Sennheiser", name: "Momentum 4 Wireless Graphite Black", price: 379, img: "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=800" },
    { cat: Category.HEADPHONES, brand: "JBL", name: "Tour One M2 Professional Headphones", price: 299, img: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800" },
    { cat: Category.HEADPHONES, brand: "Marshall", name: "Major IV Wireless 80h Playtime", price: 149, img: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800" },
    { cat: Category.HEADPHONES, brand: "Beats", name: "Beats Studio Pro Deep Navy", price: 349, img: "https://images.unsplash.com/photo-1545127398-14699f92334b?w=800" },
    { cat: Category.HEADPHONES, brand: "Sony", name: "WF-1000XM5 Premium Earbuds Black", price: 299, img: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800" },
    { cat: Category.HEADPHONES, brand: "Bowers & Wilkins", name: "Px8 Flagship Wireless Headphones", price: 699, img: "https://images.unsplash.com/photo-1583394838336-397f71f48853?w=800" },
    { cat: Category.HEADPHONES, brand: "Audio-Technica", name: "ATH-M50xBT2 Professional Monitor", price: 199, img: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800" },

    // 5. SPEAKERS
    { cat: Category.ACCESSORIES, brand: "Sonos", name: "Sonos Era 300 Spatial Audio Speaker", price: 449, img: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800" },
    { cat: Category.ACCESSORIES, brand: "Marshall", name: "Woburn III Bluetooth Home Speaker", price: 579, img: "https://images.unsplash.com/photo-1545012354-94e82410a8c2?w=800" },
    { cat: Category.ACCESSORIES, brand: "JBL", name: "Boombox 3 Waterproof Portable", price: 499, img: "https://images.unsplash.com/photo-1612198526331-766786963768?w=800" },
    { cat: Category.ACCESSORIES, brand: "Bose", name: "SoundLink Revolve II Luxe Silver", price: 219, img: "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=800" },
    { cat: Category.ACCESSORIES, brand: "Apple", name: "HomePod 2nd Gen Midnight Speaker", price: 299, img: "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800" },
    { cat: Category.ACCESSORIES, brand: "Amazon", name: "Echo Studio High-Fidelity Smart Speaker", price: 199, img: "https://images.unsplash.com/photo-1544650039-22886fbb3364?w=800" },
    { cat: Category.ACCESSORIES, brand: "Devialet", name: "Phantom I 108dB Glossy White", price: 3200, img: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800" },
    { cat: Category.ACCESSORIES, brand: "Bang & Olufsen", name: "Beosound A1 Portable Speaker", price: 279, img: "https://images.unsplash.com/photo-1545012354-94e82410a8c2?w=800" },
    { cat: Category.ACCESSORIES, brand: "Sony", name: "SRS-XG300 Powerful Party Speaker", price: 349, img: "https://images.unsplash.com/photo-1612198526331-766786963768?w=800" },
    { cat: Category.ACCESSORIES, brand: "Ultimate Ears", name: "Hyperboom Portable Wireless", price: 449, img: "https://images.unsplash.com/photo-1612198526331-766786963768?w=800" },

    // 6. CAMERAS
    { cat: Category.CAMERAS, brand: "Sony", name: "Alpha a7R V Mirrorless Camera Body", price: 3899, img: "https://images.unsplash.com/photo-1516035069174-ce6835c9d244?w=800" },
    { cat: Category.CAMERAS, brand: "Canon", name: "EOS R5 Full Frame Professional", price: 3399, img: "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?w=800" },
    { cat: Category.CAMERAS, brand: "Fujifilm", name: "Fujifilm X100VI Digital Camera", price: 1599, img: "https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=800" },
    { cat: Category.CAMERAS, brand: "Nikon", name: "Nikon Z8 8K Mirrorless Flagship", price: 3699, img: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800" },
    { cat: Category.CAMERAS, brand: "Panasonic", name: "Lumix GH6 Micro Four Thirds", price: 1699, img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800" },
    { cat: Category.CAMERAS, brand: "GoPro", name: "HERO12 Black Ultra HD Action", price: 399, img: "https://images.unsplash.com/photo-1500643752441-4dc90cbd3543?w=800" },
    { cat: Category.CAMERAS, brand: "DJI", name: "Osmo Pocket 3 Creator Combo", price: 669, img: "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?w=800" },
    { cat: Category.CAMERAS, brand: "Leica", name: "Leica M11 Rangefinder Body", price: 8995, img: "https://images.unsplash.com/photo-1502982720700-bfff9738ebac?w=800" },
    { cat: Category.CAMERAS, brand: "Sony", name: "ZV-1 II Vlogging Compact", price: 899, img: "https://images.unsplash.com/photo-1516724562728-afc824a36e84?w=800" },
    { cat: Category.CAMERAS, brand: "Fujifilm", name: "Instax Mini 12 Pastel Blue", price: 79, img: "https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=800" },

    // 7. SMARTWATCHES
    { cat: Category.SMART_HOME, brand: "Apple", name: "Apple Watch Ultra 2 Titanium", price: 799, img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800" },
    { cat: Category.SMART_HOME, brand: "Samsung", name: "Galaxy Watch 6 Classic 47mm", price: 399, img: "https://images.unsplash.com/photo-1544117518-30dd5ff7a986?w=800" },
    { cat: Category.SMART_HOME, brand: "Garmin", name: "Epix Pro Gen 2 Sapphire", price: 999, img: "https://images.unsplash.com/photo-1508685096489-7aac291253f6?w=800" },
    { cat: Category.SMART_HOME, brand: "Google", name: "Pixel Watch 2 Matte Black", price: 349, img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800" },
    { cat: Category.SMART_HOME, brand: "Withings", name: "ScanWatch Nova Hybrid Blue", price: 599, img: "https://images.unsplash.com/photo-1544117518-30dd5ff7a986?w=800" },
    { cat: Category.SMART_HOME, brand: "Fossil", name: "Gen 6 Smartwatch Brown Leather", price: 299, img: "https://images.unsplash.com/photo-1508685096489-7aac291253f6?w=800" },
    { cat: Category.SMART_HOME, brand: "Huawei", name: "Watch Ultimate Premium Edition", price: 749, img: "https://images.unsplash.com/photo-1544117518-30dd5ff7a986?w=800" },
    { cat: Category.SMART_HOME, brand: "Garmin", name: "Venu 3 GPS Health Watch", price: 449, img: "https://images.unsplash.com/photo-1508685096489-7aac291253f6?w=800" },
    { cat: Category.SMART_HOME, brand: "Apple", name: "Apple Watch Series 9 Midnight", price: 399, img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800" },
    { cat: Category.SMART_HOME, brand: "Fitbit", name: "Fitbit Charge 6 Fitness Tracker", price: 159, img: "https://images.unsplash.com/photo-1544117518-30dd5ff7a986?w=800" },

    // 8. TVs
    { cat: Category.SMART_TVS, brand: "LG", name: "LG G3 OLED Evo 77-inch Gallery", price: 3799, img: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800" },
    { cat: Category.SMART_TVS, brand: "Samsung", name: "Samsung QN900C 8K Neo QLED", price: 4499, img: "https://images.unsplash.com/photo-1567690187548-f07b1d7bf5a9?w=800" },
    { cat: Category.SMART_TVS, brand: "Sony", name: "Sony A80L XR OLED 65-inch", price: 1999, img: "https://images.unsplash.com/photo-1593784991095-a205039475fe?w=800" },
    { cat: Category.SMART_TVS, brand: "TCL", name: "TCL QM8 Mini-LED 85-inch 4K", price: 1999, img: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800" },
    { cat: Category.SMART_TVS, brand: "Hisense", name: "Hisense U7K Mini-LED 55-inch", price: 749, img: "https://images.unsplash.com/photo-1461151304267-38535e770e79?w=800" },
    { cat: Category.SMART_TVS, brand: "Philips", name: "Philips OLED808 120Hz Ambilight", price: 1399, img: "https://images.unsplash.com/photo-1577975882846-431adc8c2009?w=800" },
    { cat: Category.SMART_TVS, brand: "Samsung", name: "The Frame 4K LS03B Art TV", price: 1499, img: "https://images.unsplash.com/photo-1593784991095-a205039475fe?w=800" },
    { cat: Category.SMART_TVS, brand: "Sony", name: "Sony X90L Full Array LED 75", price: 1599, img: "https://images.unsplash.com/photo-1593784991095-a205039475fe?w=800" },
    { cat: Category.SMART_TVS, brand: "LG", name: "LG QNED85 4K Quantum Dot", price: 1099, img: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800" },
    { cat: Category.SMART_TVS, brand: "Amazon", name: "Fire TV Omni Series 4K 55", price: 449, img: "https://images.unsplash.com/photo-1583573636246-18cb2246697f?w=800" },

    // 9. ACCESSORIES
    { cat: Category.ACCESSORIES, brand: "Logitech", name: "MX Keys S Wireless Keyboard", price: 109, img: "https://images.unsplash.com/photo-1587829741301-dc798b83dadc?w=800" },
    { cat: Category.ACCESSORIES, brand: "Keychron", name: "Keychron Q3 Pro SE Custom", price: 199, img: "https://images.unsplash.com/photo-1587829741301-dc798b83dadc?w=800" },
    { cat: Category.ACCESSORIES, brand: "Anker", name: "Anker 747 GaNPrime 150W Wall Charger", price: 109, img: "https://images.unsplash.com/photo-1619131651477-80be40669f9e?w=800" },
    { cat: Category.ACCESSORIES, brand: "SanDisk", name: "4TB Extreme Pro Portable SSD", price: 329, img: "https://images.unsplash.com/photo-1595225380271-88194464627d?w=800" },
    { cat: Category.ACCESSORIES, brand: "Wacom", name: "Wacom Intuos Pro Creative Tablet", price: 349, img: "https://images.unsplash.com/photo-1589110281630-eb416cc1007e?w=800" },
    { cat: Category.ACCESSORIES, brand: "Logitech", name: "MX Master 3S Graphite Mouse", price: 99, img: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800" },
    { cat: Category.ACCESSORIES, brand: "Elgato", name: "Stream Deck + Audio Hub", price: 199, img: "https://images.unsplash.com/photo-1629429464245-48443ad3e107?w=800" },
    { cat: Category.ACCESSORIES, brand: "Rode", name: "Rode NT-USB Mini Studio Mic", price: 99, img: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800" },
    { cat: Category.ACCESSORIES, brand: "Ugreen", name: "Nexode 200W Desktop Station", price: 149, img: "https://images.unsplash.com/photo-1619131651477-80be40669f9e?w=800" },
    { cat: Category.ACCESSORIES, brand: "Apple", name: "Magic Mouse 2 Space Grey", price: 79, img: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800" },

    // 10. GAMING
    { cat: Category.GAMING, brand: "Sony", name: "PlayStation 5 Console 825GB", price: 499, img: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800" },
    { cat: Category.GAMING, brand: "Microsoft", name: "Xbox Series X Console Bundle", price: 499, img: "https://images.unsplash.com/photo-1621259182978-f09e5e2ca1ff?w=800" },
    { cat: Category.GAMING, brand: "Nintendo", name: "Switch OLED White Edition", price: 349, img: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800" },
    { cat: Category.GAMING, brand: "Valve", name: "Steam Deck OLED 1TB Top Tier", price: 649, img: "https://images.unsplash.com/photo-1669483321946-7787c88b7538?w=800" },
    { cat: Category.GAMING, brand: "Logitech", name: "Logitech G Pro X Superlight 2", price: 159, img: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800" },
    { cat: Category.GAMING, brand: "Razer", name: "BlackWidow V4 Pro Mechanical", price: 229, img: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800" },
    { cat: Category.GAMING, brand: "SteelSeries", name: "Apex Pro TKL 2023 Edition", price: 189, img: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800" },
    { cat: Category.GAMING, brand: "Corsair", name: "Dominator Titanium 64GB RAM", price: 249, img: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800" },
    { cat: Category.GAMING, brand: "Secretlab", name: "Titan Evo 2022 Series Chair", price: 549, img: "https://images.unsplash.com/photo-1598550476439-6847785fce66?w=800" },
    { cat: Category.GAMING, brand: "Asus", name: "ROG Swift PG32UCDM 4K OLED", price: 1299, img: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800" },

    // 11. ADDITIONAL SMARTPHONES
    { cat: Category.SMARTPHONES, brand: "Xiaomi", name: "Xiaomi 14 Ultra 5G Premium", price: 1199, img: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800" },
    { cat: Category.SMARTPHONES, brand: "Vivo", name: "Vivo X100 Pro 512GB Flagship", price: 999, img: "https://images.unsplash.com/photo-1711200383120-f1395c808f9c?w=800" },
    { cat: Category.SMARTPHONES, brand: "OPPO", name: "OPPO Find X7 Ultra 16GB", price: 1099, img: "https://images.unsplash.com/photo-1696602359489-09f485750d94?w=800" },
    { cat: Category.SMARTPHONES, brand: "Samsung", name: "Galaxy A95 5G Premium Mid-Range", price: 599, img: "https://images.unsplash.com/photo-1707064406087-0b6167812739?w=800" },
    { cat: Category.SMARTPHONES, brand: "Apple", name: "iPhone 14 Pro Space Black", price: 799, img: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800" },
    { cat: Category.SMARTPHONES, brand: "Google", name: "Pixel 7 Pro 128GB Cloudy White", price: 749, img: "https://images.unsplash.com/photo-1696602359489-09f485750d94?w=800" },
    { cat: Category.SMARTPHONES, brand: "OnePlus", name: "OnePlus 11 Black 256GB", price: 699, img: "https://images.unsplash.com/photo-1711200383120-f1395c808f9c?w=800" },
    { cat: Category.SMARTPHONES, brand: "Motorola", name: "Motorola Edge 50 Pro 5G", price: 749, img: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800" },
    { cat: Category.SMARTPHONES, brand: "Nothing", name: "Nothing Phone (2a) White", price: 449, img: "https://images.unsplash.com/photo-1688649102473-099b9d16aa32?w=800" },
    { cat: Category.SMARTPHONES, brand: "Samsung", name: "Galaxy Z Flip 5 Mint Green", price: 999, img: "https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00?w=800" },

    // 12. ADDITIONAL LAPTOPS
    { cat: Category.LAPTOPS, brand: "Apple", name: "MacBook Air 13 M2 256GB", price: 1199, img: "https://images.unsplash.com/photo-1517336714467-d23663d77291?w=800" },
    { cat: Category.LAPTOPS, brand: "Dell", name: "Inspiron 15 i9 RTX 4060", price: 999, img: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800" },
    { cat: Category.LAPTOPS, brand: "HP", name: "Pavilion 15 Touch 512GB SSD", price: 649, img: "https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?w=800" },
    { cat: Category.LAPTOPS, brand: "Lenovo", name: "IdeaPad Pro 7 Gen 9 16GB", price: 1399, img: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800" },
    { cat: Category.LAPTOPS, brand: "Asus", name: "Vivobook 16 AI Laptop", price: 1199, img: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800" },
    { cat: Category.LAPTOPS, brand: "MSI", name: "Prestige 14 EVO i7 32GB", price: 1799, img: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800" },
    { cat: Category.LAPTOPS, brand: "Microsoft", name: "Surface Laptop Studio 2", price: 1999, img: "https://images.unsplash.com/photo-1611186871348-b1ec696e52c9?w=800" },
    { cat: Category.LAPTOPS, brand: "Razer", name: "Blade 15 RTX 4080", price: 2999, img: "https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=800" },
    { cat: Category.LAPTOPS, brand: "Google", name: "Pixelbook Go Intel Core m3", price: 999, img: "https://images.unsplash.com/photo-1580522154071-c6ca47a859ad?w=800" },
    { cat: Category.LAPTOPS, brand: "Samsung", name: "Galaxy Book4 Pro 16 AMOLED", price: 1699, img: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800" },

    // 13. ADDITIONAL HEADPHONES
    { cat: Category.HEADPHONES, brand: "Anker", name: "Soundcore Space A40 ANC", price: 99, img: "https://images.unsplash.com/photo-1618366712277-70ac3700078b?w=800" },
    { cat: Category.HEADPHONES, brand: "Technics", name: "EAH-AZ80 Premium Earbuds", price: 299, img: "https://images.unsplash.com/photo-1505740420928-5c5597c6d9a0?w=800" },
    { cat: Category.HEADPHONES, brand: "Shure", name: "SE215 IEM Studio Grade", price: 199, img: "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800" },
    { cat: Category.HEADPHONES, brand: "Bang & Olufsen", name: "Beoplay E8 Premium AirPods", price: 349, img: "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=800" },
    { cat: Category.HEADPHONES, brand: "Jabra", name: "Elite 8 Active Plus", price: 229, img: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800" },
    { cat: Category.HEADPHONES, brand: "Turtle Beach", name: "Stealth Pro Xbox Headset", price: 199, img: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800" },
    { cat: Category.HEADPHONES, brand: "HyperX", name: "CloudMix Hybrid Gaming", price: 159, img: "https://images.unsplash.com/photo-1545127398-14699f92334b?w=800" },
    { cat: Category.HEADPHONES, brand: "Denon", name: "AH-GC30 Premium Over-Ear", price: 379, img: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800" },
    { cat: Category.HEADPHONES, brand: "Skullcandy", name: "Crusher EVO Wireless Bass", price: 199, img: "https://images.unsplash.com/photo-1583394838336-397f71f48853?w=800" },
    { cat: Category.HEADPHONES, brand: "Creative", name: "Aurvana Ace 2 Hi-Fi Headphone", price: 429, img: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800" },

    // 14. ADDITIONAL ACCESSORIES
    { cat: Category.ACCESSORIES, brand: "Belkin", name: "MagSafe Car Mount Pro", price: 39, img: "https://images.unsplash.com/photo-1587829741301-dc798b83dadc?w=800" },
    { cat: Category.ACCESSORIES, brand: "Mophie", name: "Powerstation XXL 35000mAh", price: 149, img: "https://images.unsplash.com/photo-1619131651477-80be40669f9e?w=800" },
    { cat: Category.ACCESSORIES, brand: "Nomad", name: "Leather Wallet RFID Blocking", price: 59, img: "https://images.unsplash.com/photo-1595225380271-88194464627d?w=800" },
    { cat: Category.ACCESSORIES, brand: "Native Union", name: "Drop XL Wireless Charger", price: 79, img: "https://images.unsplash.com/photo-1589110281630-eb416cc1007e?w=800" },
    { cat: Category.ACCESSORIES, brand: "Peak Design", name: "Capture Clip Pro", price: 49, img: "https://images.unsplash.com/photo-1629429464245-48443ad3e107?w=800" },
    { cat: Category.ACCESSORIES, brand: "Twelve South", name: "AirFly Pro 2 Wireless Adapter", price: 79, img: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800" },
    { cat: Category.ACCESSORIES, brand: "Caldigit", name: "Thunderbolt 4 Dock 6-Port", price: 349, img: "https://images.unsplash.com/photo-1619131651477-80be40669f9e?w=800" },
    { cat: Category.ACCESSORIES, brand: "CableCreation", name: "USB-C Hub 7-in-1 Multiport", price: 49, img: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800" },
    { cat: Category.ACCESSORIES, brand: "Spigen", name: "Tough Armor Phone Case", price: 19, img: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800" },
    { cat: Category.ACCESSORIES, brand: "dbramante1928", name: "Premium Leather iPhone Case", price: 89, img: "https://images.unsplash.com/photo-1567690187548-f07b1d7bf5a9?w=800" },

    // 15. SMART TVS CONTINUED
    { cat: Category.SMART_TVS, brand: "Hisense", name: "Hisense U8H 65-inch Mini LED", price: 1199, img: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800" },
    { cat: Category.SMART_TVS, brand: "Insignia", name: "Insignia 55-inch 4K Fire TV", price: 299, img: "https://images.unsplash.com/photo-1461151304267-38535e770e79?w=800" },
    { cat: Category.SMART_TVS, brand: "Vizio", name: "Vizio M-Series Quantum 55", price: 499, img: "https://images.unsplash.com/photo-1577975882846-431adc8c2009?w=800" },
    { cat: Category.SMART_TVS, brand: "LG", name: "LG C3 OLED 55-inch 4K", price: 1299, img: "https://images.unsplash.com/photo-1593784991095-a205039475fe?w=800" },
    { cat: Category.SMART_TVS, brand: "Samsung", name: "Samsung M70C 4K Monitor TV", price: 1399, img: "https://images.unsplash.com/photo-1593784991095-a205039475fe?w=800" },
  ];

  dataset.forEach((item, index) => {
    products.push({
      id: `ep-${index + 1}`,
      brand: item.brand,
      name: item.name,
      price: item.price,
      images: [item.img],
      category: item.cat,
      stock: Math.floor(Math.random() * 20) + 5,
      description: `Official ${item.brand} ${item.name}. Engineered for premium performance in the ${item.cat.toLowerCase()} space. Experience industry-leading technology and build quality.`,
      specs: {
        "Brand": item.brand,
        "Warranty": "2-Year Manufacturer",
        "Availability": "Immediate Dispatch",
        "Condition": "Brand New"
      }
    });
  });

  return products;
};

export const INITIAL_PRODUCTS: Product[] = generateProducts();
export const CATEGORIES = Object.values(Category);

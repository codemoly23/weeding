import "dotenv/config";
import prisma from "../src/lib/db";

async function main() {
  let header = await prisma.headerConfig.findFirst({ where: { isActive: true } });
  if (!header) {
    header = await prisma.headerConfig.create({
      data: {
        name: "Default Header", isActive: true, layout: "DEFAULT", sticky: true,
        transparent: false, logoPosition: "LEFT", logoMaxHeight: 56,
        showAuthButtons: true, loginText: "Log in", registerText: "Join now",
        registerUrl: "/register", searchEnabled: false, mobileBreakpoint: 1024,
        height: 64, topBarEnabled: true,
      },
    });
  } else {
    await prisma.menuItem.deleteMany({ where: { headerId: header.id } });
  }

  const h = header.id;
  const top = (label: string, url: string | null, order: number, cols: number) =>
    prisma.menuItem.create({ data: { headerId: h, label, url, sortOrder: order, isVisible: true, visibleOnMobile: true, isMegaMenu: true, megaMenuColumns: cols } });
  const cat = (parentId: string, label: string, order: number) =>
    prisma.menuItem.create({ data: { headerId: h, parentId, label, url: null, sortOrder: order, isVisible: true, visibleOnMobile: true } });
  const svc = (parentId: string, label: string, url: string, icon: string | null, order: number) =>
    prisma.menuItem.create({ data: { headerId: h, parentId, label, url, icon, sortOrder: order, isVisible: true, visibleOnMobile: true } });

  // 1. Planning Tools (2 cols)
  const pt = await top("Planning Tools", null, 0, 2);
  const org = await cat(pt.id, "Organize with ease", 0);
  await svc(org.id, "Checklist", "/tools/checklist", "ClipboardList", 0);
  await svc(org.id, "Seating chart", "/tools/seating", "LayoutDashboard", 1);
  await svc(org.id, "Event Vendors", "/vendors", "FolderOpen", 2);
  await svc(org.id, "Guests", "/tools/guests", "Users", 3);
  await svc(org.id, "Budget", "/tools/budget", "Calculator", 4);
  await svc(org.id, "Event website", "/wedding-website", "Globe", 5);
  const per = await cat(pt.id, "Personalize your event", 1);
  await svc(per.id, "Hotel Blocks", "/tools/hotel-blocks", null, 0);
  await svc(per.id, "Date Finder", "/tools/date-finder", null, 1);
  await svc(per.id, "Cost Guide", "/tools/cost-guide", null, 2);
  await svc(per.id, "Color generator", "/tools/color-generator", null, 3);
  await svc(per.id, "Hashtag generator", "/tools/hashtag-generator", null, 4);

  // 2. Venues (3 cols)
  const vn = await top("Venues", "/venues", 1, 3);
  const wv = await cat(vn.id, "Wedding Venues", 0);
  await svc(wv.id, "All Wedding Venues", "/venues/wedding", "Heart", 0);
  await svc(wv.id, "Banquet Halls", "/venues/banquet-halls", "Building2", 1);
  await svc(wv.id, "Wineries", "/venues/wineries", "Wine", 2);
  await svc(wv.id, "Gardens", "/venues/gardens", "Flower2", 3);
  await svc(wv.id, "Beach Venues", "/venues/beach", "Waves", 4);
  await svc(wv.id, "Mansions", "/venues/mansions", "Home", 5);
  const pv = await cat(vn.id, "Party & Event Venues", 1);
  await svc(pv.id, "Party Halls", "/venues/party-halls", "PartyPopper", 0);
  await svc(pv.id, "Conference Centers", "/venues/conference-centers", "Briefcase", 1);
  await svc(pv.id, "Hotels", "/venues/hotels", "Hotel", 2);
  await svc(pv.id, "Historic Venues", "/venues/historic", "Landmark", 3);
  await svc(pv.id, "Yachts & Boats", "/venues/yachts", "Ship", 4);
  await svc(pv.id, "Outdoor Venues", "/venues/outdoor", "TreePine", 5);
  const sv = await cat(vn.id, "Specialty Venues", 2);
  await svc(sv.id, "Religious Venues", "/venues/religious", "Church", 0);
  await svc(sv.id, "Luxury Estates", "/venues/luxury", "Diamond", 1);
  await svc(sv.id, "Destination Venues", "/venues/destination", "Plane", 2);
  await svc(sv.id, "Unique Spaces", "/venues/unique", "Sparkles", 3);
  await svc(sv.id, "Find Near Me", "/venues/near-me", "MapPin", 4);

  // 3. Vendors (2 cols)
  const vd = await top("Vendors", "/vendors", 2, 2);
  const fv = await cat(vd.id, "Find Vendors", 0);
  await svc(fv.id, "All Vendors", "/vendors", "Store", 0);
  await svc(fv.id, "Photographers", "/vendors/photographers", "Camera", 1);
  await svc(fv.id, "Caterers", "/vendors/caterers", "UtensilsCrossed", 2);
  await svc(fv.id, "Florists", "/vendors/florists", "Flower2", 3);
  await svc(fv.id, "DJs & Bands", "/vendors/music", "Music", 4);
  await svc(fv.id, "Hair & Makeup", "/vendors/beauty", "Sparkles", 5);
  const sp = await cat(vd.id, "Specialists", 1);
  await svc(sp.id, "Wedding Planners", "/vendors/planners", "ClipboardList", 0);
  await svc(sp.id, "Officiants", "/vendors/officiants", "BookOpen", 1);
  await svc(sp.id, "Transportation", "/vendors/transportation", "Car", 2);
  await svc(sp.id, "Videographers", "/vendors/videographers", "Video", 3);
  await svc(sp.id, "Cakes & Desserts", "/vendors/cakes", "Cake", 4);
  await svc(sp.id, "Jewelers", "/vendors/jewelry", "Gem", 5);

  // 4. Forums (2 cols)
  const fo = await top("Forums", "/forums", 3, 2);
  const cm = await cat(fo.id, "Community", 0);
  await svc(cm.id, "Wedding Planning", "/forums/wedding-planning", "ClipboardList", 0);
  await svc(cm.id, "Budget & Finance", "/forums/budget", "Calculator", 1);
  await svc(cm.id, "Venues & Vendors", "/forums/venues-vendors", "Building2", 2);
  await svc(cm.id, "Fashion & Beauty", "/forums/fashion", "Shirt", 3);
  await svc(cm.id, "Honeymoon", "/forums/honeymoon", "Plane", 4);
  const ins = await cat(fo.id, "Inspiration", 1);
  await svc(ins.id, "DIY Projects", "/forums/diy", "Hammer", 0);
  await svc(ins.id, "Real Weddings", "/forums/real-weddings", "Heart", 1);
  await svc(ins.id, "Newlyweds", "/forums/newlyweds", "HeartHandshake", 2);
  await svc(ins.id, "Photo Ideas", "/forums/photos", "Camera", 3);

  // 5. Dresses (3 cols)
  const dr = await top("Dresses", "/dresses", 4, 3);
  const brl = await cat(dr.id, "Bridal", 0);
  await svc(brl.id, "Bridal Gowns", "/dresses/bridal", "Shirt", 0);
  await svc(brl.id, "Bridesmaid Dresses", "/dresses/bridesmaid", "Users", 1);
  await svc(brl.id, "Mother of the Bride", "/dresses/mother-of-bride", "Heart", 2);
  await svc(brl.id, "Flower Girl Dresses", "/dresses/flower-girl", "Flower2", 3);
  const grm = await cat(dr.id, "Groom", 1);
  await svc(grm.id, "Suits & Tuxedos", "/dresses/suits", "Briefcase", 0);
  await svc(grm.id, "Groomsmen Attire", "/dresses/groomsmen", "Users", 1);
  const acc = await cat(dr.id, "Accessories", 2);
  await svc(acc.id, "Jewelry", "/dresses/jewelry", "Gem", 0);
  await svc(acc.id, "Shoes", "/dresses/shoes", "Footprints", 1);
  await svc(acc.id, "Veils & Headpieces", "/dresses/veils", "Sparkles", 2);

  // 6. Ideas (2 cols)
  const idm = await top("Ideas", "/ideas", 5, 2);
  const dco = await cat(idm.id, "Decor", 0);
  await svc(dco.id, "Wedding Themes", "/ideas/themes", "Palette", 0);
  await svc(dco.id, "Floral Arrangements", "/ideas/flowers", "Flower2", 1);
  await svc(dco.id, "Table Settings", "/ideas/tables", "LayoutDashboard", 2);
  await svc(dco.id, "Ceremony Decor", "/ideas/ceremony", "Star", 3);
  const cel = await cat(idm.id, "Celebration", 1);
  await svc(cel.id, "Reception Ideas", "/ideas/reception", "PartyPopper", 0);
  await svc(cel.id, "Wedding Favors", "/ideas/favors", "Gift", 1);
  await svc(cel.id, "Photo Ideas", "/ideas/photos", "Camera", 2);
  await svc(cel.id, "Honeymoon Ideas", "/ideas/honeymoon", "Plane", 3);

  // 7. Registry (2 cols)
  const rg = await top("Registry", "/registry", 6, 2);
  const rt = await cat(rg.id, "Registry", 0);
  await svc(rt.id, "Create a Registry", "/registry/create", "PlusCircle", 0);
  await svc(rt.id, "Find a Registry", "/registry/find", "Search", 1);
  const rc = await cat(rg.id, "Categories", 1);
  await svc(rc.id, "Home & Kitchen", "/registry/home", "Home", 0);
  await svc(rc.id, "Travel Fund", "/registry/travel", "Plane", 1);
  await svc(rc.id, "Cash Fund", "/registry/cash", "Banknote", 2);
  await svc(rc.id, "Experiences", "/registry/experiences", "Sparkles", 3);

  // 8. Wedding Website (2 cols)
  const ww = await top("Wedding Website", "/wedding-website", 7, 2);
  const gst = await cat(ww.id, "Get Started", 0);
  await svc(gst.id, "Create Website", "/wedding-website/create", "Globe", 0);
  await svc(gst.id, "Themes & Designs", "/wedding-website/themes", "Palette", 1);
  await svc(gst.id, "Custom Domain", "/wedding-website/domain", "Link", 2);
  const ftrs = await cat(ww.id, "Features", 1);
  await svc(ftrs.id, "RSVP Management", "/wedding-website/rsvp", "Users", 0);
  await svc(ftrs.id, "Guest Pages", "/wedding-website/guests", "UserCheck", 1);
  await svc(ftrs.id, "Photo Gallery", "/wedding-website/gallery", "Image", 2);
  await svc(ftrs.id, "Our Story", "/wedding-website/story", "BookHeart", 3);

  console.log("Menu restored with correct 3-level structure (top -> category -> items)");
  console.log("All 8 menus now have mega dropdowns.");
}

main().catch(console.error);

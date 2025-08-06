import { MerchantPattern, CategoryRule } from "./types";

/**
* Bank-specific parsing patterns
* Add new bank formats here
*/

export const BANK_PATTERNS = {
    // Generic pattern that works for most Saudi banks
    generic: {
        description: /^([^\n]+)/,
        amount: /بـ\s*([\d,\.]+)\s*([A-Z]{3})/,
        merchant: /من\s+([^\n]+)/,
        card: /مدى\s*(\d+\*)/,
        account: /حساب\s*(\d+\*)/,
        date: /في\s*(\d{2}-\d{2}-\d{1,2})/,
    },

    // Al Rajhi Bank (الراجحي) - Most popular bank in Saudi
    alrajhi: {
        description: /^([^\n]+)/,
        amount: /(?:قيمة|مبلغ|بقيمة)\s*([\d,\.]+)\s*([A-Z]{3})/,
        merchant: /(?:من|لدى|عند)\s+([^\n]+)/,
        card: /(?:بطاقة|كارت)\s*(\d+\*+)/,
        account: /(?:حساب|رقم الحساب)\s*(\d+\*+)/,
        date: /(?:بتاريخ|في|تاريخ)\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
        reference: /(?:مرجع|رقم مرجع)\s*([A-Z0-9]+)/,
        terminal: /(?:طرفية|جهاز)\s*([A-Z0-9]+)/,
    },

    // National Commercial Bank (الأهلي) - NCB/AlAhli
    ncb: {
        description: /^([^\n]+)/,
        amount: /(?:المبلغ|القيمة|بمبلغ)\s*([\d,\.]+)\s*([A-Z]{3})/,
        merchant: /(?:التاجر|من|لدى)\s+([^\n]+)/,
        card: /(?:البطاقة|كارت)\s*(\d+\*+)/,
        account: /(?:الحساب|حساب رقم)\s*(\d+\*+)/,
        date: /(?:التاريخ|في)\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
        branch: /(?:الفرع|فرع)\s*(\d+)/,
        reference: /(?:الرقم المرجعي|مرجع)\s*([A-Z0-9]+)/,
    },

    // Riyad Bank (بنك الرياض)
    riyad: {
        description: /^([^\n]+)/,
        amount: /(?:بمبلغ|المبلغ|قدره)\s*([\d,\.]+)\s*([A-Z]{3})/,
        merchant: /(?:من|لصالح|إلى)\s+([^\n]+)/,
        card: /(?:بطاقة رقم|البطاقة)\s*(\d+\*+)/,
        account: /(?:من الحساب|الحساب)\s*(\d+\*+)/,
        date: /(?:بتاريخ|في يوم)\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
        time: /(?:الساعة|وقت)\s*(\d{1,2}:\d{2})/,
        location: /(?:في|بـ)\s+([^0-9\n]+)/,
    },

    // SAMBA Bank (سامبا) - Now part of SNB
    samba: {
        description: /^([^\n]+)/,
        amount: /(?:بقيمة|مقدار|بمبلغ)\s*([\d,\.]+)\s*([A-Z]{3})/,
        merchant: /(?:من|عند|لدى)\s+([^\n]+)/,
        card: /(?:بالبطاقة|البطاقة)\s*(\d+\*+)/,
        account: /(?:الحساب|من حساب)\s*(\d+\*+)/,
        date: /(?:في|بتاريخ)\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
        approval: /(?:رقم الموافقة|الموافقة)\s*([A-Z0-9]+)/,
    },

    // Saudi National Bank (البنك الأهلي السعودي) - SNB (merged SAMBA + NCB)
    snb: {
        description: /^([^\n]+)/,
        amount: /(?:بمبلغ|القيمة|المبلغ)\s*([\d,\.]+)\s*([A-Z]{3})/,
        merchant: /(?:من|التاجر|عند)\s+([^\n]+)/,
        card: /(?:البطاقة|بطاقة رقم)\s*(\d+\*+)/,
        account: /(?:الحساب|حساب)\s*(\d+\*+)/,
        date: /(?:في|التاريخ|بتاريخ)\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
        channel: /(?:القناة|عبر)\s+([^\n]+)/,
        reference: /(?:المرجع|رقم مرجعي)\s*([A-Z0-9]+)/,
    },

    // Saudi Investment Bank (البنك السعودي للاستثمار) - SAIB
    saib: {
        description: /^([^\n]+)/,
        amount: /(?:بمبلغ|قيمة|مقدار)\s*([\d,\.]+)\s*([A-Z]{3})/,
        merchant: /(?:من|لدى|عند)\s+([^\n]+)/,
        card: /(?:بطاقة|كرت)\s*(\d+\*+)/,
        account: /(?:حساب|الحساب رقم)\s*(\d+\*+)/,
        date: /(?:بتاريخ|في)\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
        type: /(?:نوع العملية|العملية)\s+([^\n]+)/,
    },

    // Banque Saudi Fransi (البنك السعودي الفرنسي) - BSF
    bsf: {
        description: /^([^\n]+)/,
        amount: /(?:مبلغ|بقيمة|القيمة)\s*([\d,\.]+)\s*([A-Z]{3})/,
        merchant: /(?:من|عند|التاجر)\s+([^\n]+)/,
        card: /(?:البطاقة|بطاقة)\s*(\d+\*+)/,
        account: /(?:الحساب|حساب رقم)\s*(\d+\*+)/,
        date: /(?:في|التاريخ)\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
        location: /(?:المكان|في)\s+([^0-9\n]+)/,
    },

    // Arab National Bank (البنك العربي الوطني) - ANB
    anb: {
        description: /^([^\n]+)/,
        amount: /(?:بمبلغ|المبلغ|قدره)\s*([\d,\.]+)\s*([A-Z]{3})/,
        merchant: /(?:من|لصالح|عند)\s+([^\n]+)/,
        card: /(?:بطاقة رقم|البطاقة)\s*(\d+\*+)/,
        account: /(?:من حساب|الحساب)\s*(\d+\*+)/,
        date: /(?:بتاريخ|في)\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
        balance: /(?:الرصيد|الرصيد المتاح)\s*([\d,\.]+)/,
    },

    // Saudi British Bank (البنك السعودي البريطاني) - SABB
    sabb: {
        description: /^([^\n]+)/,
        amount: /(?:Amount|مبلغ|القيمة)\s*([\d,\.]+)\s*([A-Z]{3})/,
        merchant: /(?:من|From|Merchant)\s+([^\n]+)/,
        card: /(?:Card|البطاقة|بطاقة)\s*(\d+\*+)/,
        account: /(?:Account|الحساب|حساب)\s*(\d+\*+)/,
        date: /(?:Date|في|التاريخ)\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
        reference: /(?:Ref|مرجع|Reference)\s*([A-Z0-9]+)/,
    },

    // Bank AlJazira (بنك الجزيرة)
    aljazira: {
        description: /^([^\n]+)/,
        amount: /(?:بمبلغ|قيمة|المبلغ)\s*([\d,\.]+)\s*([A-Z]{3})/,
        merchant: /(?:من|عند|لدى)\s+([^\n]+)/,
        card: /(?:بطاقة|البطاقة)\s*(\d+\*+)/,
        account: /(?:حساب|الحساب)\s*(\d+\*+)/,
        date: /(?:في|بتاريخ)\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
        terminal: /(?:الجهاز|طرفية)\s*([A-Z0-9]+)/,
    },

    // Bank Albilad (بنك البلاد)
    albilad: {
        description: /^([^\n]+)/,
        amount: /(?:بمبلغ|القيمة|مقدار)\s*([\d,\.]+)\s*([A-Z]{3})/,
        merchant: /(?:من|التاجر|عند)\s+([^\n]+)/,
        card: /(?:بطاقة|البطاقة رقم)\s*(\d+\*+)/,
        account: /(?:الحساب|حساب)\s*(\d+\*+)/,
        date: /(?:بتاريخ|في|التاريخ)\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
        branch: /(?:الفرع|فرع رقم)\s*(\d+)/,
    },

    // First Abu Dhabi Bank (بنك أبوظبي الأول) - FAB
    fab: {
        description: /^([^\n]+)/,
        amount: /(?:Amount|مبلغ|بقيمة)\s*([\d,\.]+)\s*([A-Z]{3})/,
        merchant: /(?:من|From|at)\s+([^\n]+)/,
        card: /(?:Card|بطاقة)\s*(\d+\*+)/,
        account: /(?:Account|حساب)\s*(\d+\*+)/,
        date: /(?:Date|في|on)\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
        reference: /(?:Ref|مرجع)\s*([A-Z0-9]+)/,
    },

    // STC Pay (الدفع الرقمي - stc pay)
    stcpay: {
        description: /^([^\n]+)/,
        amount: /(?:مبلغ|بقيمة|القيمة)\s*([\d,\.]+)\s*([A-Z]{3})/,
        merchant: /(?:إلى|من|للتاجر)\s+([^\n]+)/,
        account: /(?:محفظة|الرقم)\s*(\d+\*+)/,
        date: /(?:في|بتاريخ)\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
        time: /(?:الساعة|وقت)\s*(\d{1,2}:\d{2})/,
        type: /(?:نوع العملية|العملية)\s+([^\n]+)/,
        reference: /(?:رقم العملية|مرجع)\s*([A-Z0-9]+)/,
    },

    // Mobily Pay (موبايلي باي)
    mobilypay: {
        description: /^([^\n]+)/,
        amount: /(?:مبلغ|بقيمة|القيمة)\s*([\d,\.]+)\s*([A-Z]{3})/,
        merchant: /(?:إلى|من|للتاجر)\s+([^\n]+)/,
        account: /(?:محفظة|رقم المحفظة)\s*(\d+\*+)/,
        date: /(?:في|التاريخ)\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
        reference: /(?:رقم المرجع|مرجع)\s*([A-Z0-9]+)/,
    },

    // Zain Pay (زين باي)
    zainpay: {
        description: /^([^\n]+)/,
        amount: /(?:مبلغ|القيمة|بقيمة)\s*([\d,\.]+)\s*([A-Z]{3})/,
        merchant: /(?:إلى|من|التاجر)\s+([^\n]+)/,
        account: /(?:محفظة|الرقم)\s*(\d+\*+)/,
        date: /(?:في|بتاريخ)\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
        reference: /(?:رقم العملية|مرجع)\s*([A-Z0-9]+)/,
    },

    // Alinma Bank (بنك الإنماء)
    alinma: {
        description: /^([^\n]+)/,
        amount: /(?:بمبلغ|المبلغ|قيمة)\s*([\d,\.]+)\s*([A-Z]{3})/,
        merchant: /(?:من|عند|لدى)\s+([^\n]+)/,
        card: /(?:بطاقة|البطاقة)\s*(\d+\*+)/,
        account: /(?:الحساب|حساب رقم)\s*(\d+\*+)/,
        date: /(?:بتاريخ|في|التاريخ)\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
        islamic: /(?:وفقاً للشريعة|شريعة|إسلامي)/,
    },

    // Bank AlBilad (مصرف الراجحي الإسلامي)
    rajhiislamic: {
        description: /^([^\n]+)/,
        amount: /(?:بمبلغ|القيمة|مقدار)\s*([\d,\.]+)\s*([A-Z]{3})/,
        merchant: /(?:من|لدى|عند)\s+([^\n]+)/,
        card: /(?:بطاقة|البطاقة)\s*(\d+\*+)/,
        account: /(?:الحساب|حساب)\s*(\d+\*+)/,
        date: /(?:في|بتاريخ)\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
        islamic: /(?:حلال|شرعي|إسلامي)/,
    },

    // Generic Apple Pay format
    applepay: {
        description: /^([^\n]+)/,
        amount: /(?:بـ|بمبلغ|Amount)\s*([\d,\.]+)\s*([A-Z]{3})/,
        merchant: /(?:من|From|at)\s+([^\n]+)/,
        card: /(?:Apple Pay|آبل باي).*(\d+\*+)/,
        date: /(?:في|on|Date)\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
        device: /(?:iPhone|iPad|Apple Watch|آيفون|آيباد)/,
    },

    // Generic Samsung Pay format
    samsungpay: {
        description: /^([^\n]+)/,
        amount: /(?:بـ|بمبلغ|Amount)\s*([\d,\.]+)\s*([A-Z]{3})/,
        merchant: /(?:من|From|at)\s+([^\n]+)/,
        card: /(?:Samsung Pay|سامسونج باي).*(\d+\*+)/,
        date: /(?:في|on|Date)\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
        device: /(?:Galaxy|سامسونج)/,
    },

    // MADA (نظام مدى) - Generic MADA card format
    mada: {
        description: /^([^\n]+)/,
        amount: /(?:بـ|بمبلغ|مبلغ)\s*([\d,\.]+)\s*([A-Z]{3})/,
        merchant: /(?:من|عند|لدى)\s+([^\n]+)/,
        card: /(?:مدى|MADA)\s*(\d+\*+)/,
        account: /(?:حساب|الحساب)\s*(\d+\*+)/,
        date: /(?:في|بتاريخ)\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
        terminal: /(?:طرفية|جهاز)\s*([A-Z0-9]+)/,
    },

    // VISA format (international cards)
    visa: {
        description: /^([^\n]+)/,
        amount: /(?:Amount|مبلغ|بـ)\s*([\d,\.]+)\s*([A-Z]{3})/,
        merchant: /(?:من|From|at)\s+([^\n]+)/,
        card: /(?:VISA|فيزا).*(\d+\*+)/,
        date: /(?:في|on|Date)\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
        reference: /(?:Ref|مرجع)\s*([A-Z0-9]+)/,
    },

    // Mastercard format (international cards)
    mastercard: {
        description: /^([^\n]+)/,
        amount: /(?:Amount|مبلغ|بـ)\s*([\d,\.]+)\s*([A-Z]{3})/,
        merchant: /(?:من|From|at)\s+([^\n]+)/,
        card: /(?:MasterCard|Mastercard|ماستركارد).*(\d+\*+)/,
        date: /(?:في|on|Date)\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
        reference: /(?:Ref|مرجع)\s*([A-Z0-9]+)/,
    },

    // Tamara (Buy Now Pay Later)
    tamara: {
        description: /^([^\n]+)/,
        amount: /(?:بمبلغ|القيمة|مبلغ)\s*([\d,\.]+)\s*([A-Z]{3})/,
        merchant: /(?:من|عند|لدى)\s+([^\n]+)/,
        installment: /(?:قسط|دفعة)\s*(\d+)\s*من\s*(\d+)/,
        date: /(?:في|بتاريخ)\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
        reference: /(?:رقم الطلب|رقم المرجع)\s*([A-Z0-9]+)/,
    },

    // Tabby (Buy Now Pay Later)
    tabby: {
        description: /^([^\n]+)/,
        amount: /(?:بمبلغ|القيمة|مبلغ)\s*([\d,\.]+)\s*([A-Z]{3})/,
        merchant: /(?:من|عند|التاجر)\s+([^\n]+)/,
        installment: /(?:قسط|دفعة)\s*(\d+)/,
        date: /(?:في|بتاريخ)\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
        reference: /(?:رقم الطلب|Order)\s*([A-Z0-9]+)/,
    },
};

/**
* Known merchant patterns for normalization
* Add new merchant patterns here
*/
export const MERCHANT_PATTERNS: MerchantPattern[] = [
    { pattern: /spotify\s*ab/i, normalizedName: "Spotify", category: "Subscriptions" },
    { pattern: /netflix/i, normalizedName: "Netflix", category: "Subscriptions" },
    { pattern: /amazon.*prime/i, normalizedName: "Amazon Prime", category: "Subscriptions" },
    { pattern: /starbucks/i, normalizedName: "Starbucks", category: "Food & Dining" },
    { pattern: /carrefour|كارفور/i, normalizedName: "Carrefour", category: "Groceries" },
    { pattern: /uber/i, normalizedName: "Uber", category: "Transportation" },
    { pattern: /careem|كريم/i, normalizedName: "Careem", category: "Transportation" },
];

/**
* Category classification rules - easily extensible
* Add new keywords and categories here
*/
export const CATEGORY_RULES: CategoryRule[] = [
    // Subscriptions & Digital Services
    {
        keywords: ["spotify", "netflix", "amazon prime", "youtube", "apple music", "shahid", "stc tv", "موسيقى", "اشتراك"],
        category: "Subscriptions",
        priority: 90,
    },

    // Food & Dining
    {
        keywords: ["مطعم", "كافيه", "مقهى", "بيتزا", "برجر", "كنتاكي", "ماكدونالدز", "pizza", "burger", "restaurant", "cafe", "kfc", "mcdonalds", "starbucks", "dunkin"],
        category: "Food & Dining",
        priority: 85,
    },

    // Groceries & Supermarkets
    {
        keywords: ["كارفور", "هايبر", "سوبر ماركت", "بقالة", "تموينات", "carrefour", "lulu", "panda", "danube", "extra"],
        category: "Groceries",
        priority: 85,
    },

    // Transport & Fuel
    {
        keywords: ["بنزين", "وقود", "تاكسي", "أوبر", "كريم", "مواقف", "رسوم طريق", "uber", "careem", "taxi", "fuel", "gas", "petrol", "aramco"],
        category: "Transportation",
        priority: 80,
    },

    // Shopping & Retail
    {
        keywords: ["تسوق", "متجر", "مول", "ملابس", "أزياء", "shopping", "mall", "store", "fashion", "zara", "h&m", "adidas", "nike"],
        category: "Shopping",
        priority: 75,
    },

    // Healthcare
    {
        keywords: ["صيدلية", "مستشفى", "عيادة", "طبيب", "دواء", "pharmacy", "hospital", "clinic", "medical", "nahdi", "aldawaa"],
        category: "Healthcare",
        priority: 80,
    },

    // Utilities & Bills
    {
        keywords: ["كهرباء", "مياه", "إنترنت", "جوال", "اتصالات", "موبايلي", "زين", "electricity", "water", "internet", "mobile", "stc", "mobily", "zain"],
        category: "Utilities",
        priority: 85,
    },

    // Entertainment
    {
        keywords: ["سينما", "ألعاب", "ملاهي", "ترفيه", "cinema", "games", "entertainment", "vox", "muvi"],
        category: "Entertainment",
        priority: 70,
    },

    // ATM & Banking
    {
        keywords: ["صراف", "سحب نقدي", "atm", "cash withdrawal", "رسوم مصرفية", "bank fee"],
        category: "Banking & ATM",
        priority: 95,
    },
];
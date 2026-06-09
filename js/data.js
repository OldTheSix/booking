/**
 * booking-web 数据存储层
 * 此文件由后台导出，请勿手动修改
 * 导出时间：2026/6/9 20:40:00
 */

const STORAGE_KEYS = {
  SERVICES: 'booking_services',
  BOOKINGS: 'booking_bookings',
  DISCOUNT_RULES: 'booking_discount_rules',
  SHARE_RECORDS: 'booking_share_records',
  NEW_BOOKING_COUNT: 'booking_new_count'
};

// ============ 占位图片生成 ============
function getPlaceholderImage(name, width, height) {
  const colors = ['4CAF50', '2196F3', 'FF9800', '9C27B0', 'F44336', '009688'];
  const hash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const color = colors[hash % colors.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect fill="#${color}" width="${width}" height="${height}"/><text x="50%" y="50%" font-size="${Math.min(width, height) / 6}" fill="white" text-anchor="middle" dy=".3em" font-family="sans-serif">${name}</text></svg>`;
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}

// ============ 默认服务数据 ============
function getDefaultServices() {
  const lunchItems = [
    { name: "土鸡", desc: "健过身的", price: 138, mode: "dish", unit: "", image: "" },
    { name: "腊肉", desc: "下饭腊肉", price: 46, mode: "dish", unit: "", image: "" },
    { name: "回锅肉", desc: "阿姨炒的回锅肉", price: 38, mode: "dish", unit: "", image: "" },
    { name: "木瓜浸鸡", desc: "补", price: 168, mode: "dish", unit: "", image: "" },
    { name: "中药药膳鸡", desc: "大补", price: 188, mode: "dish", unit: "", image: "" },
    { name: "辣炒鸡肉", desc: "一只", price: 148, mode: "dish", unit: "", image: "" },
    { name: "辣炒鸡肉半只/汤半只", desc: "半只炒半只汤", price: 148, mode: "dish", unit: "", image: "" },
    { name: "空心菜", desc: "阿姨自己种的", price: 26, mode: "dish", unit: "", image: "" },
    { name: "豆角", desc: "阿姨自己种的", price: 26, mode: "dish", unit: "", image: "" },
    { name: "番薯叶", desc: "阿姨自己种的", price: 26, mode: "dish", unit: "", image: "" },
    { name: "鸡蛋汤", desc: "土鸡生的", price: 28, mode: "dish", unit: "", image: "" },
    { name: "米饭一锅", desc: "", price: 10, mode: "dish", unit: "", image: "" }
  ];

  // 动态生成图片（在页面加载时调用 getPlaceholderImage）
  lunchItems.forEach(item => {
    item._name = item.name;
  });

  return [
    {
      id: "fishing",
      name: "休闲钓鱼",
      icon: "🎣",
      desc: "水库垂钓，支持自带渔具",
      price: 30,
      unit: "人",
      images: [],
      menuCategories: []
    },
    {
      id: "lunch",
      name: "午餐",
      icon: "🍱",
      desc: "特色农家菜，新鲜食材",
      price: 0,
      unit: "桌",
      images: [],
      menuCategories: [
        {
          name: "健身土鸡",
          items: lunchItems
        }
      ]
    },
    {
      id: "dinner",
      name: "晚餐",
      icon: "🍲",
      desc: "烧烤+火锅，夜宵好去处",
      price: 0,
      unit: "桌",
      images: [],
      menuCategories: [
        {
          name: "晚",
          items: [
            { name: "烧烤", desc: "特色烧烤", price: 30, mode: "per_person", unit: "人", image: "" },
            { name: "火锅", desc: "鸳鸯锅", price: 50, mode: "per_person", unit: "人", image: "" }
          ]
        }
      ]
    },
    {
      id: "group",
      name: "团建娱乐",
      icon: "🎉",
      desc: "团建、聚会、娱乐一站式",
      price: 0,
      unit: "项",
      images: [],
      menuCategories: [
        {
          name: "娱乐项目",
          items: [
            { name: "KTV", desc: "专业KTV设备", price: 200, mode: "per_unit", unit: "场", image: "" },
            { name: "麻将", desc: "自动麻将桌", price: 100, mode: "per_unit", unit: "桌", image: "" }
          ]
        }
      ]
    }
  ];
}

function getDefaultDiscountRules() {
  return [
    {
      id: 'discount_95',
      name: '全场95折',
      percent: 95,
      minAmount: 0,
      applyTo: 'all',
      enabled: true
    }
  ];
}

// ============ 服务管理 ============
function getServices() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SERVICES);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  const defaults = getDefaultServices();
  localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(defaults));
  return defaults;
}

function saveServices(services) {
  localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
}

function getServiceById(id) {
  return getServices().find(function(s) { return s.id === id; });
}

// ============ 预约管理 ============
function getBookings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}

function saveBookings(bookings) {
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
}

function addBooking(booking) {
  const bookings = getBookings();
  booking.id = 'BK' + Date.now();
  booking.createTime = new Date().toISOString();
  bookings.unshift(booking);
  saveBookings(bookings);
  const count = parseInt(localStorage.getItem(STORAGE_KEYS.NEW_BOOKING_COUNT) || '0') + 1;
  localStorage.setItem(STORAGE_KEYS.NEW_BOOKING_COUNT, count);
  syncBookingsToCloud();
  return booking;
}

function syncBookingsToCloud() {
  const bookings = getBookings();
  const services = getServices();
  const discounts = getDiscountRules();
  cloudWrite({ services: services, discounts: discounts, bookings: bookings }, function(err) {
    if (err) console.error('Sync bookings failed:', err);
  });
}

function updateBookingStatus(id, status) {
  const bookings = getBookings();
  const b = bookings.find(function(x) { return x.id === id; });
  if (b) b.status = status;
  saveBookings(bookings);
  syncBookingsToCloud();
}

function deleteBooking(id) {
  let bookings = getBookings();
  bookings = bookings.filter(function(x) { return x.id !== id; });
  saveBookings(bookings);
  syncBookingsToCloud();
}

// ============ 折扣规则 ============
function getDiscountRules() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DISCOUNT_RULES);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  const defaults = getDefaultDiscountRules();
  if (defaults.length > 0) localStorage.setItem(STORAGE_KEYS.DISCOUNT_RULES, JSON.stringify(defaults));
  return defaults;
}

function saveDiscountRules(rules) {
  localStorage.setItem(STORAGE_KEYS.DISCOUNT_RULES, JSON.stringify(rules));
}

// ============ 工具函数 ============
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function formatDateTime(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

function calcDiscount(rawTotal, selectedServiceIds) {
  const rules = getDiscountRules().filter(function(r) { return r.enabled !== false; });
  let bestRule = null;
  rules.forEach(function(r) {
    if (r.minAmount > 0 && rawTotal < r.minAmount) return;
    const applyMatch = !r.applyTo || r.applyTo === 'all' || selectedServiceIds.indexOf(r.applyTo) > -1;
    if (!applyMatch) return;
    if (!bestRule || r.percent < bestRule.percent) bestRule = r;
  });
  if (bestRule && bestRule.percent < 100) {
    return {
      discountAmount: Math.round(rawTotal * (1 - bestRule.percent / 100)),
      discountLabel: (bestRule.percent / 10) + '折'
    };
  }
  return { discountAmount: 0, discountLabel: '' };
}

// ============ 云同步 ============
const CLOUD_BLOB_ID = '019eaab5-09e0-7bef-8984-bea37614f8be';

function cloudWrite(data, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('PUT', 'https://jsonblob.com/api/jsonBlob/' + CLOUD_BLOB_ID, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status >= 200 && xhr.status < 300) callback(null);
      else callback(new Error('HTTP ' + xhr.status));
    }
  };
  xhr.onerror = function() { callback(new Error('Network error')); };
  xhr.send(JSON.stringify(data));
}

function cloudRead(callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://jsonblob.com/api/jsonBlob/' + CLOUD_BLOB_ID, true);
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status >= 200 && xhr.status < 300) {
        try { callback(null, JSON.parse(xhr.responseText)); }
        catch (e) { callback(e); }
      } else {
        callback(new Error('HTTP ' + xhr.status));
      }
    }
  };
  xhr.onerror = function() { callback(new Error('Network error')); };
  xhr.send();
}

function loadFromCloud(callback) {
  cloudRead(function(err, data) {
    if (err || !data) {
      try {
        localStorage.removeItem(STORAGE_KEYS.SERVICES);
        localStorage.removeItem(STORAGE_KEYS.DISCOUNT_RULES);
        localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
      } catch(e) {}
      if (typeof callback === 'function') callback(false);
      return;
    }
    try {
      if (data.services) localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(data.services));
      if (data.discounts) localStorage.setItem(STORAGE_KEYS.DISCOUNT_RULES, JSON.stringify(data.discounts));
      if (data.bookings) localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(data.bookings));
      if (typeof callback === 'function') callback(true);
    } catch (e) {
      if (typeof callback === 'function') callback(false);
    }
  });
}

// ============ 图片占位符（在页面加载时调用）============
function initPlaceholderImages() {
  const services = getServices();
  services.forEach(function(svc) {
    if (svc.menuCategories) {
      svc.menuCategories.forEach(function(cat) {
        (cat.items || []).forEach(function(item) {
          if (!item.image || item.image === '') {
            item.image = getPlaceholderImage(item.name, 200, 200);
          }
        });
      });
    }
  });
  saveServices(services);
}

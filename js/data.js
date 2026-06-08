/**
 * booking-web 数据存储层
 * 使用 localStorage 持久化，兼容无后端场景
 * 结构与原微信小程序保持一致
 */

const STORAGE_KEYS = {
  SERVICES: 'booking_services',
  BOOKINGS: 'booking_bookings',
  DISCOUNT_RULES: 'booking_discount_rules',
  SHARE_RECORDS: 'booking_share_records',
  NEW_BOOKING_COUNT: 'booking_new_count'
};

// ============ 默认服务数据 ============
function getDefaultServices() {
  return [
    {
      id: 'fishing',
      name: '休闲钓鱼',
      icon: '🎣',
      desc: '水库垂钓，支持自带渔具',
      price: 30,
      unit: '人',
      images: [],
      menuCategories: []
    },
    {
      id: 'lunch',
      name: '午餐',
      icon: '🍱',
      desc: '特色农家菜，新鲜食材',
      price: 0,
      unit: '桌',
      images: [],
      menuCategories: [
        {
          name: '特色菜',
          items: [
            { name: '红烧鲤鱼', desc: '水库鲜活鲤鱼', price: 88, image: '', mode: 'dish' },
            { name: '农家小炒肉', desc: '本地猪肉', price: 48, image: '', mode: 'dish' },
            { name: '清炒时蔬', desc: '当日新鲜蔬菜', price: 28, image: '', mode: 'dish' }
          ]
        }
      ]
    },
    {
      id: 'dinner',
      name: '晚餐',
      icon: '🍲',
      desc: '烧烤+火锅，夜宵好去处',
      price: 0,
      unit: '桌',
      images: [],
      menuCategories: [
        {
          name: '烧烤',
          items: [
            { name: '烤全鱼', desc: '水库鱼现烤', price: 68, image: '', mode: 'dish' },
            { name: '烤羊肉串', desc: '新鲜羊肉', price: 8, image: '', mode: 'per_unit', unit: '串' },
            { name: '烤玉米', desc: '甜玉米', price: 5, image: '', mode: 'per_unit', unit: '根' }
          ]
        }
      ]
    },
    {
      id: 'team',
      name: '团建娱乐',
      icon: '🎉',
      desc: '公司团建、生日派对、朋友聚会',
      price: 0,
      unit: '人',
      images: [],
      menuCategories: [
        {
          name: '娱乐项目',
          items: [
            { name: 'KTV包厢', desc: '专业音响设备', price: 200, image: '', mode: 'per_unit', unit: '小时' },
            { name: '麻将房', desc: '自动麻将机', price: 50, image: '', mode: 'per_unit', unit: '小时' },
            { name: '品茶区', desc: '安静品茶聊天', price: 30, image: '', mode: 'per_person' }
          ]
        }
      ]
    }
  ];
}

// ============ 服务管理 ============
function getServices() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SERVICES);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  // 首次使用，写入默认数据
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
  // 新预约计数
  const count = parseInt(localStorage.getItem(STORAGE_KEYS.NEW_BOOKING_COUNT) || '0') + 1;
  localStorage.setItem(STORAGE_KEYS.NEW_BOOKING_COUNT, count);
  return booking;
}

function updateBookingStatus(id, status) {
  const bookings = getBookings();
  const b = bookings.find(function(x) { return x.id === id; });
  if (b) b.status = status;
  saveBookings(bookings);
}

function deleteBooking(id) {
  let bookings = getBookings();
  bookings = bookings.filter(function(x) { return x.id !== id; });
  saveBookings(bookings);
}

// ============ 折扣规则 ============
function getDiscountRules() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DISCOUNT_RULES);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
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

// 计算折扣
function calcDiscount(rawTotal, selectedServiceIds) {
  const rules = getDiscountRules().filter(function(r) { return r.enabled !== false; });
  let bestRule = null;
  rules.forEach(function(r) {
    if (r.minAmount > 0 && rawTotal < r.minAmount) return;
    const applyMatch = !r.applyTo || r.applyTo === 'all' || selectedServiceIds.indexOf(r.applyTo) > -1;
    if (!applyMatch) return;
    if (!bestRule || r.percent < bestRule.percent) {
      bestRule = r;
    }
  });
  if (bestRule && bestRule.percent < 100) {
    return {
      discountAmount: Math.round(rawTotal * (1 - bestRule.percent / 100)),
      discountLabel: (bestRule.percent / 10) + '折'
    };
  }
  return { discountAmount: 0, discountLabel: '' };
}

// 图片转 base64（压缩）
function compressImage(file, maxWidth, quality) {
  maxWidth = maxWidth || 800;
  quality = quality || 0.6;
  return new Promise(function(resolve, reject) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) {
          h = Math.round(h * maxWidth / w);
          w = maxWidth;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

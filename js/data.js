/**
 * booking-web 数据存储层
 * 使用 JSONBlob 云端存储 + localStorage 缓存
 * 后台修改自动同步到云端，朋友打开自动读取最新数据
 */

const STORAGE_KEYS = {
  SERVICES: 'booking_services',
  BOOKINGS: 'booking_bookings',
  DISCOUNT_RULES: 'booking_discount_rules',
  SHARE_RECORDS: 'booking_share_records',
  NEW_BOOKING_COUNT: 'booking_new_count',
  CLOUD_SYNC_TIME: 'booking_cloud_sync_time'
};

// ============ 云端配置 ============
var CLOUD_BLOB_ID = '019eaab5-09e0-7bef-8984-bea37614f8be';
var CLOUD_API_URL = 'https://jsonblob.com/api/jsonBlob/' + CLOUD_BLOB_ID;

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
          name: '健身土鸡',
          items: [
            { name: '土鸡', desc: '健过身的', price: 138, image: '', mode: 'dish' },
            { name: '腊肉', desc: '下饭腊肉', price: 46, image: '', mode: 'dish' },
            { name: '回锅肉', desc: '阿姨炒的回锅肉', price: 38, image: '', mode: 'dish' },
            { name: '木瓜浸鸡', desc: '补', price: 168, image: '', mode: 'dish' },
            { name: '中药药膳鸡', desc: '大补', price: 188, image: '', mode: 'dish' },
            { name: '辣炒鸡肉', desc: '一只', price: 148, image: '', mode: 'dish' },
            { name: '辣炒鸡肉半', desc: '半只炒半只', price: 0, image: '', mode: 'dish' },
            { name: '空心菜', desc: '阿姨自己种的', price: 0, image: '', mode: 'dish' },
            { name: '豆角', desc: '阿姨自己种的', price: 0, image: '', mode: 'dish' },
            { name: '番薯叶', desc: '阿姨自己种的', price: 0, image: '', mode: 'dish' },
            { name: '鸡蛋汤', desc: '土鸡生的', price: 0, image: '', mode: 'dish' },
            { name: '米饭一锅', desc: '', price: 10, image: '', mode: 'dish' }
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
          name: '晚',
          items: [
            { name: '土鸡', desc: '', price: 138, image: '', mode: 'dish' },
            { name: '腊肉', desc: '', price: 46, image: '', mode: 'dish' },
            { name: '回锅肉', desc: '', price: 38, image: '', mode: 'dish' },
            { name: '木瓜鸡', desc: '', price: 168, image: '', mode: 'dish' },
            { name: '药膳鸡', desc: '', price: 188, image: '', mode: 'dish' },
            { name: '辣椒炒鸡', desc: '', price: 148, image: '', mode: 'dish' },
            { name: '半只炒鸡半', desc: '', price: 148, image: '', mode: 'dish' },
            { name: '空心菜', desc: '', price: 26, image: '', mode: 'dish' },
            { name: '豆角', desc: '', price: 26, image: '', mode: 'dish' },
            { name: '番薯叶', desc: '', price: 26, image: '', mode: 'dish' },
            { name: '鸡蛋汤', desc: '', price: 28, image: '', mode: 'dish' },
            { name: '米饭一锅', desc: '', price: 10, image: '', mode: 'dish' }
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
            { name: '娱乐麻将', desc: '16/小时', price: 16, image: '', mode: 'per_unit', unit: '小时' },
            { name: '品茶区', desc: '安静品茶聊天', price: 30, image: '', mode: 'per_person' }
          ]
        }
      ]
    }
  ];
}

// ============ 云端读写 ============
function cloudRead(callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', CLOUD_API_URL, true);
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.timeout = 8000;
  xhr.onload = function() {
    if (xhr.status === 200) {
      try {
        var data = JSON.parse(xhr.responseText);
        callback(null, data);
      } catch (e) {
        callback(e, null);
      }
    } else {
      callback(new Error('HTTP ' + xhr.status), null);
    }
  };
  xhr.onerror = function() { callback(new Error('network error'), null); };
  xhr.ontimeout = function() { callback(new Error('timeout'), null); };
  xhr.send();
}

function cloudWrite(data, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('PUT', CLOUD_API_URL, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.timeout = 10000;
  xhr.onload = function() {
    if (xhr.status === 200 || xhr.status === 201) {
      localStorage.setItem(STORAGE_KEYS.CLOUD_SYNC_TIME, new Date().toISOString());
      callback(null);
    } else {
      callback(new Error('HTTP ' + xhr.status));
    }
  };
  xhr.onerror = function() { callback(new Error('network error')); };
  xhr.ontimeout = function() { callback(new Error('timeout')); };
  xhr.send(JSON.stringify(data));
}

// ============ 服务管理 ============
function getServices() {
  try {
    var raw = localStorage.getItem(STORAGE_KEYS.SERVICES);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  var defaults = getDefaultServices();
  localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(defaults));
  return defaults;
}

function saveServices(services) {
  localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
  // 自动同步到云端
  syncToCloud('services', services);
}

function getServiceById(id) {
  return getServices().find(function(s) { return s.id === id; });
}

// ============ 预约管理 ============
function getBookings() {
  try {
    var raw = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}

function saveBookings(bookings) {
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
}

function addBooking(booking) {
  var bookings = getBookings();
  booking.id = 'BK' + Date.now();
  booking.createTime = new Date().toISOString();
  bookings.unshift(booking);
  saveBookings(bookings);
  var count = parseInt(localStorage.getItem(STORAGE_KEYS.NEW_BOOKING_COUNT) || '0') + 1;
  localStorage.setItem(STORAGE_KEYS.NEW_BOOKING_COUNT, count);
  return booking;
}

function updateBookingStatus(id, status) {
  var bookings = getBookings();
  var b = bookings.find(function(x) { return x.id === id; });
  if (b) b.status = status;
  saveBookings(bookings);
}

function deleteBooking(id) {
  var bookings = getBookings();
  bookings = bookings.filter(function(x) { return x.id !== id; });
  saveBookings(bookings);
}

// ============ 折扣规则 ============
function getDiscountRules() {
  try {
    var raw = localStorage.getItem(STORAGE_KEYS.DISCOUNT_RULES);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}

function saveDiscountRules(rules) {
  localStorage.setItem(STORAGE_KEYS.DISCOUNT_RULES, JSON.stringify(rules));
  // 自动同步到云端
  syncToCloud('discounts', rules);
}

// ============ 云端同步 ============
// 后台保存时 → 推送到云端
function syncToCloud(key, data) {
  // 先读云端当前数据，再合并
  cloudRead(function(err, cloudData) {
    if (err) {
      console.warn('云端读取失败，跳过同步:', err.message);
      return;
    }
    if (!cloudData) cloudData = {};
    cloudData[key] = data;
    cloudWrite(cloudData, function(err2) {
      if (err2) {
        console.warn('云端写入失败:', err2.message);
      } else {
        console.log('✅ 云端同步成功:', key);
      }
    });
  });
}

// 朋友打开时 → 从云端拉取最新数据
function loadFromCloud(callback) {
  cloudRead(function(err, cloudData) {
    if (err || !cloudData) {
      console.warn('云端加载失败，使用本地数据');
      if (callback) callback(false);
      return;
    }
    // 用云端数据更新本地
    if (cloudData.services && cloudData.services.length > 0) {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(cloudData.services));
    }
    if (cloudData.discounts) {
      localStorage.setItem(STORAGE_KEYS.DISCOUNT_RULES, JSON.stringify(cloudData.discounts));
    }
    localStorage.setItem(STORAGE_KEYS.CLOUD_SYNC_TIME, new Date().toISOString());
    console.log('✅ 云端数据已同步到本地');
    if (callback) callback(true);
  });
}

// ============ 工具函数 ============
function formatDate(dateStr) {
  if (!dateStr) return '';
  var d = new Date(dateStr);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function formatDateTime(isoStr) {
  if (!isoStr) return '';
  var d = new Date(isoStr);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

function calcDiscount(rawTotal, selectedServiceIds) {
  var rules = getDiscountRules().filter(function(r) { return r.enabled !== false; });
  var bestRule = null;
  rules.forEach(function(r) {
    if (r.minAmount > 0 && rawTotal < r.minAmount) return;
    var applyMatch = !r.applyTo || r.applyTo === 'all' || selectedServiceIds.indexOf(r.applyTo) > -1;
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

function compressImage(file, maxWidth, quality) {
  maxWidth = maxWidth || 800;
  quality = quality || 0.6;
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.onload = function(e) {
      var img = new Image();
      img.onload = function() {
        var canvas = document.createElement('canvas');
        var w = img.width, h = img.height;
        if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

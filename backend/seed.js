import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 建立管理員帳號 - landseed
  const passwordHash = await bcrypt.hash('landseed1012', 10);

  await prisma.admin.upsert({
    where: { username: 'landseed' },
    update: { passwordHash },
    create: {
      username: 'landseed',
      passwordHash
    }
  });

  console.log('Admin user created: landseed / landseed1012');

  // 建立範例飲料店（大安區）- 2025 最新資訊
  const stores = [
    {
      name: '50嵐',
      type: '手搖飲',
      region: '大安區',
      address: '台北市大安區復興南路一段219號',
      menuUrl: 'http://50lan.com/web/products.asp',
      menuImageUrl: 'https://cpok.tw/wp-content/uploads/2023/02/50-lan-menu-north.jpg',
      uberUrl: 'https://www.ubereats.com/tw/store/50嵐-南西店/37hYFU8hVvedcTcgos8qPw',
      pandaUrl: 'https://www.foodpanda.com.tw/chain/cv5pc/50-lan'
    },
    {
      name: '清心福全',
      type: '手搖飲',
      region: '大安區',
      address: '台北市大安區忠孝東路四段181巷7號',
      menuUrl: 'https://www.chingshin.tw/product.php',
      menuImageUrl: 'https://www.chingshin.tw/assets/images/pc_menu_item_img_7.png',
      uberUrl: 'https://www.ubereats.com/tw/brand/ching-shin-fu-chuan',
      pandaUrl: 'https://www.foodpanda.com.tw/chain/cv5io/ching-xin-fu-quan'
    },
    {
      name: '迷客夏',
      type: '鮮奶茶專賣',
      region: '大安區',
      address: '台北市大安區延吉街137巷2號',
      menuUrl: 'https://www.milksha.com/',
      menuImageUrl: 'https://finnnote.com/wp-content/uploads/2024/11/milksha-menu-north-2024.jpg',
      uberUrl: 'https://www.ubereats.com/tw/store/迷客夏-milksha-臺北延吉店/s6ipODqBQj2kdWOz5ReFSQ',
      pandaUrl: 'https://www.foodpanda.com.tw/chain/ck8kt/mi-ke-xia'
    },
    {
      name: '可不可熟成紅茶',
      type: '熟成紅茶專賣',
      region: '大安區',
      address: '台北市大安區復興南路二段271巷2號',
      menuUrl: 'https://kebuke.com/menu/',
      menuImageUrl: 'https://kebuke.com/wp-content/uploads/2025/04/官網菜單圖案-_工作區域-1.png',
      uberUrl: 'https://www.ubereats.com/tw/store/可不可熟成紅茶-科技大樓店/VCKBAwaqRUmnBroOifyuZQ',
      pandaUrl: 'https://www.foodpanda.com.tw/chain/cv5iy/ke-bu-ke-shu-cheng-hong-cha'
    },
    {
      name: '茶湯會',
      type: '手搖飲',
      region: '大安區',
      address: '台北市大安區忠孝東路三段300號B1',
      menuUrl: 'https://tw.tp-tea.com/menu/',
      menuImageUrl: 'https://tw.tp-tea.com/upload/menu/2025_11月小DM_價目_百貨.jpg',
      uberUrl: 'https://www.ubereats.com/tw/brand/tp-tea',
      pandaUrl: 'https://www.foodpanda.com.tw/chain/cv5pt/cha-tang-hui'
    },
    {
      name: '鶴茶樓',
      type: '紅茶專賣',
      region: '大安區',
      address: '台北市大安區忠孝東路四段205巷7弄11號',
      menuUrl: 'https://hechaloutea.com.tw/drinks/',
      menuImageUrl: 'https://hechaloutea.com.tw/wp-content/uploads/2024/08/鶴茶樓菜單.jpg',
      uberUrl: 'https://www.ubereats.com/tw/store/鶴茶樓-鶴頂紅茶商店-忠孝復興店/-5eBNc2QTmSSI1k3MvqxHA',
      pandaUrl: 'https://www.foodpanda.com.tw/chain/cx1gf/he-cha-lou'
    },
    {
      name: '不要對我尖叫',
      type: '文青手搖',
      region: '大安區',
      address: '台北市大安區大安路一段51巷16號',
      menuUrl: 'https://www.instagram.com/dontyellme/',
      menuImageUrl: 'https://i.imgur.com/dontyellme-menu.jpg',
      uberUrl: 'https://www.ubereats.com/tw/brand/dontyellme'
    },
    {
      name: '大苑子',
      type: '水果茶專賣',
      region: '大安區',
      address: '台北市大安區和平東路二段118-4號',
      menuUrl: 'https://www.dayunzi.com.tw/',
      menuImageUrl: 'https://www.dayunzi.com.tw/upload/menu.jpg',
      uberUrl: 'https://www.ubereats.com/tw/brand/dayunzi',
      pandaUrl: 'https://www.foodpanda.com.tw/chain/cv5iu/da-yuan-zi'
    },
    {
      name: 'CoCo都可',
      type: '手搖飲',
      region: '大安區',
      address: '台北市大安區羅斯福路三段283號',
      menuUrl: 'https://www.coco-tea.com/',
      menuImageUrl: 'https://www.coco-tea.com/upload/menu.jpg',
      uberUrl: 'https://www.ubereats.com/tw/brand/coco',
      pandaUrl: 'https://www.foodpanda.com.tw/chain/cv5js/coco-du-ke'
    },
    {
      name: '一沐日',
      type: '手搖飲',
      region: '大安區',
      address: '台北市大安區復興南路一段107巷5弄18號',
      menuUrl: 'https://www.facebook.com/yimuri.tw/',
      menuImageUrl: 'https://i.imgur.com/yimuri-menu.jpg',
      uberUrl: 'https://www.ubereats.com/tw/brand/yimuri'
    }
  ];

  for (const store of stores) {
    await prisma.store.upsert({
      where: { name: store.name },
      update: store,
      create: store
    });
  }

  console.log(`Created ${stores.length} sample stores`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

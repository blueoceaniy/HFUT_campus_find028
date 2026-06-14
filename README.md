# HFUT Campus Interactive Map

这是一个关于合肥工业大学校园的交互式地图应用。

## 项目特性

- 🗺️ 交互式校园地图
- 🏢 建筑物信息展示
- 📍 重要地点标记
- 🌳 景观和绿化信息
- 🚗 道路和路线规划

## 部署

该项目已部署在 Vercel 上，您可以访问以下链接：
- **项目页面**: https://vercel.com/blueoceaniys-projects/hfut-campus-028map
- **公共访问链接**: https://hfut-campus-028map.vercel.app

## 技术栈

- HTML5
- CSS3
- JavaScript (Leaflet.js 地图库)
- GeoJSON 数据格式

## 项目结构

```
HFUT_campus_find028/
├── index.html           # 主页面
├── style.css           # 样式文件
├── main.js             # 主要逻辑
├── data.js             # 数据配置
├── vercel.json         # Vercel 部署配置
├── data/               # GeoJSON 数据文件
│   ├── buildings.geojson    # 建筑物数据
│   ├── gates.geojson        # 校门数据
│   ├── roads.geojson        # 道路数据
│   ├── water.geojson        # 水体数据
│   ├── leisure.geojson      # 休闲区域数据
│   ├── routes.geojson       # 路线数据
│   ├── points.geojson       # 兴趣点数据
│   └── tree.geojson         # 树木数据
├── images/             # 图片资源
└── videos/             # 视频资源
```

## 使用方法

1. 打开 `index.html` 文件在浏览器中查看地图
2. 点击地图上的标记来查看更多信息
3. 使用地图控件缩放和平移地图

## GitHub 仓库

- **仓库地址**: https://github.com/blueoceaniy/HFUT_campus_find028
- **主分支**: main

## 许可证

MIT

## 联系方式

如有任何问题或建议，欢迎提交 Issue 或 Pull Request。

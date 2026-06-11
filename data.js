// ==================== 路线数据 ====================
const ROUTES_DATA = {
  north_gate: {
    name: "北门路线",
    gateName: "北门",
    nodes: 8,
    nodes_list: [
      {
        id: 1,
        name: "北门入口",
        action: {
          visitor: "从北门进入校园后，请沿前方较宽的校园主路直行。",
          student: "北门进入后沿主路直行。",
          fast: "北门 → 直行。"
        },
        check: "看到前方较宽的校园道路，说明方向正确。",
        risk: "不要进入两侧较窄的小路。",
        image: "#"
      },
      {
        id: 2,
        name: "校园主路",
        action: {
          visitor: "继续沿主路前进，保持向校园核心区域移动。",
          student: "沿主路继续前进。",
          fast: "继续直行。"
        },
        check: "道路两侧出现较开阔绿化与建筑群，说明已经进入校园内部。",
        risk: "不要被支路吸引提前转弯。",
        image: "#"
      },
      {
        id: 3,
        name: "湖区附近",
        action: {
          visitor: "经过湖区附近时，沿高亮路线继续向建筑群方向前进。",
          student: "湖区旁继续沿路线走。",
          fast: "沿湖区路线前进。"
        },
        check: "看到水体和开阔绿地时，说明位置正确。",
        risk: "湖区周边小路较多，不要绕入景观路径。",
        image: "#"
      },
      {
        id: 4,
        name: "关键路口",
        action: {
          visitor: "在路口按照高亮路线转向，进入通往逸夫建艺馆的主路径。",
          student: "按路线转向。",
          fast: "转向。"
        },
        check: "转向后会朝向更开阔的校园空间。",
        risk: "这是容易走错的位置，需要确认路线方向。",
        image: "#"
      },
      {
        id: 5,
        name: "建筑群区域",
        action: {
          visitor: "继续沿路线走，会进入教学建筑群区域。",
          student: "继续前进。",
          fast: "继续前进。"
        },
        check: "看到多个教学建筑和广场说明进入建筑区。",
        risk: "建筑群相似，要确认往逸夫建艺馆方向。",
        image: "#"
      },
      {
        id: 6,
        name: "接近逸夫建艺馆",
        action: {
          visitor: "沿当前道路继续向前方白灰色大型建筑靠近。",
          student: "继续靠近白灰色建筑。",
          fast: "前方目标建筑。"
        },
        check: "如果看到密集竖向窗带、红色入口门头和顶部红色构件，说明已经接近逸夫建艺馆。",
        risk: "不要转向其他相似教学建筑。",
        image: "#"
      },
      {
        id: 7,
        name: "逸夫建艺馆前场",
        action: {
          visitor: "直走进入建筑前场，准备进入建筑。",
          student: "进入建筑前场。",
          fast: "进入前场。"
        },
        check: "看到建筑的红色门头和完整建筑立面。",
        risk: "确认进入的是逸夫建艺馆正入口。",
        image: "#"
      },
      {
        id: 8,
        name: "逸夫建艺馆入口",
        action: {
          visitor: "从红色门头下方入口进入建筑，继续按照室内导览前往028教室。",
          student: "从入口进入，继续找028。",
          fast: "进楼 → 找028。"
        },
        check: "看到入口处红色标识和建筑门厅，说明室外路线已经完成。",
        risk: "028教室在建筑内部，到达入口不等于任务完成。",
        image: "#"
      }
    ]
  },

  small_north_gate: {
    name: "北侧门路线",
    gateName: "北侧门",
    nodes: 7,
    nodes_list: [
      {
        id: 1,
        name: "北侧门入口",
        action: {
          visitor: "从北侧门进入校园后，先确认进入方向，再沿北侧道路前进。",
          student: "北侧门进入后沿北侧道路走。",
          fast: "北侧门 → 北侧道路。"
        },
        check: "入口后道路较窄，看到校园内部建筑群说明方向正确。",
        risk: "不要误入宿舍区内部道路。",
        image: "#"
      },
      {
        id: 2,
        name: "北侧道路",
        action: {
          visitor: "沿北侧道路向校园中心方向前进，注意第一个转向点。",
          student: "沿北侧道路前进。",
          fast: "继续前进。"
        },
        check: "道路右侧出现连续建筑，说明仍在正确路线上。",
        risk: "北侧路线转向较多，注意不要提前转弯。",
        image: "#"
      },
      {
        id: 3,
        name: "第一个转向",
        action: {
          visitor: "在T字路口右转，进入校园主干道。",
          student: "右转进入主干道。",
          fast: "右转。"
        },
        check: "转向后道路变宽，校园中心方向明确。",
        risk: "这个转向很关键，确认右转方向。",
        image: "#"
      },
      {
        id: 4,
        name: "靠近湖区",
        action: {
          visitor: "沿主干道继续前进，接近校园湖区。",
          student: "继续前进。",
          fast: "继续直行。"
        },
        check: "能看到开阔的水体和绿化。",
        risk: "不要偏离主干道。",
        image: "#"
      },
      {
        id: 5,
        name: "转向逸夫方向",
        action: {
          visitor: "在路口按指示转向，朝逸夫建艺馆方向走。",
          student: "按路线转向。",
          fast: "转向。"
        },
        check: "转向后能看到逸夫建艺馆方向。",
        risk: "确认转向位置正确。",
        image: "#"
      },
      {
        id: 6,
        name: "接近逸夫建艺馆",
        action: {
          visitor: "沿当前道路继续向白灰色大型建筑靠近。",
          student: "靠近目标建筑。",
          fast: "前方目标。"
        },
        check: "看到竖向窗带和红色门头。",
        risk: "不要转向其他建筑。",
        image: "#"
      },
      {
        id: 7,
        name: "逸夫建艺馆入口",
        action: {
          visitor: "从红色门头下方入口进入建筑。",
          student: "从入口进入。",
          fast: "进楼 → 找028。"
        },
        check: "看到红色标识和建筑门厅。",
        risk: "确认在逸夫建艺馆入口。",
        image: "#"
      }
    ]
  },

  south_gate: {
    name: "南门路线",
    gateName: "南门",
    nodes: 8,
    nodes_list: [
      {
        id: 1,
        name: "南门入口",
        action: {
          visitor: "从南门进入校园后，沿校园外围道路向北方向前进。",
          student: "南门进入后向北走。",
          fast: "南门 → 向北。"
        },
        check: "看到校园围栏和左侧建筑群。",
        risk: "不要向东西方向转向。",
        image: "#"
      },
      {
        id: 2,
        name: "外围道路",
        action: {
          visitor: "继续沿外围道路前进，逐渐靠近校园核心区。",
          student: "沿外围道路走。",
          fast: "继续直行。"
        },
        check: "路边建筑逐渐增多，说明接近校园内部。",
        risk: "不要误入校园内部支路。",
        image: "#"
      },
      {
        id: 3,
        name: "靠近东体区",
        action: {
          visitor: "经过东体育区附近，继续保持北向前进。",
          student: "过体育区继续北走。",
          fast: "继续北行。"
        },
        check: "能看到体育设施和广场。",
        risk: "不要进入体育区内部。",
        image: "#"
      },
      {
        id: 4,
        name: "校园主干道",
        action: {
          visitor: "进入校园主干道，沿中轴线向北方向走。",
          student: "进入主干道。",
          fast: "进入主干道。"
        },
        check: "宽敞的道路两侧有建筑群。",
        risk: "确认沿正确的中轴线走。",
        image: "#"
      },
      {
        id: 5,
        name: "靠近湖区",
        action: {
          visitor: "继续沿主干道走，接近校园湖区。",
          student: "继续前进。",
          fast: "继续直行。"
        },
        check: "开始看到水体和绿地。",
        risk: "不要绕入湖区周边的景观路。",
        image: "#"
      },
      {
        id: 6,
        name: "转向逸夫方向",
        action: {
          visitor: "在路口按指示转向，进入通往逸夫建艺馆的路线。",
          student: "按路线转向。",
          fast: "转向。"
        },
        check: "能清晰看到逸夫建艺馆方向。",
        risk: "这是关键转向点，确认方向。",
        image: "#"
      },
      {
        id: 7,
        name: "接近逸夫建艺馆",
        action: {
          visitor: "沿路线继续靠近白灰色的逸夫建艺馆。",
          student: "靠近目标建筑。",
          fast: "前方目标。"
        },
        check: "看到明显的竖向窗带和红色门头。",
        risk: "区分其他相似教学楼。",
        image: "#"
      },
      {
        id: 8,
        name: "逸夫建艺馆入口",
        action: {
          visitor: "从红色门头下方入口进入建筑，继续室内导览。",
          student: "从入口进入。",
          fast: "进楼 → 找028。"
        },
        check: "看到红色入口标识和门厅。",
        risk: "确认到达逸夫建艺馆入口。",
        image: "#"
      }
    ]
  }
};

// ==================== 模式文案 ====================
const MODE_NAMES = {
  visitor: "校外访客模式",
  student: "校内学生模式",
  fast: "快速路线模式"
};

// ==================== 室内导览数据 ====================
const INDOOR_DATA = {
  steps: [
    {
      num: 1,
      title: "进入建筑入口",
      desc: "从红色门头下方入口进入建筑"
    },
    {
      num: 2,
      title: "前往楼梯",
      desc: "沿室内走廊直行找到楼梯"
    },
    {
      num: 3,
      title: "上楼前往 028",
      desc: "通过楼梯到达 028 所在楼层"
    },
    {
      num: 4,
      title: "确认门牌",
      desc: "看到 028 门牌即为到达"
    }
  ]
};

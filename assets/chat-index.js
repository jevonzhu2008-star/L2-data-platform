window.L2_CHAT_INDEX = {
 "version": "1",
 "generatedAt": "2026-11-10 17:17",
 "summary": "CMOC L2 PBI 报表开发平台：11 个报表页，语义模型含 15 张表、24 个度量值、17 条关系；另有 13 个指标映射 Excel。可回答报表结构、表与字段、度量值 DAX、指标口径与映射来源；平台不提供业务数值查询。",
 "objects": [
  {
   "id": "table:L2-01-02 集团合并利润汇总表",
   "kind": "table",
   "code": "L2-01-02",
   "name": "L2-01-02 集团合并利润汇总表",
   "text": "语义模型表：L2-01-02 集团合并利润汇总表（fact）。字段：加载日期、结构唯一ID、季度、当月YTD、同比YTD、去年同期YTD、预算YTD、预算达成率、环比MTD、当月MTD、上月MTD、月份、实际值、月份排序、结构、结构排序。来源：SAP BW；SharePoint",
   "keywords": [
    "L2-01-02 集团合并利润汇总表",
    "L2-01-02",
    "加载日期",
    "结构唯一ID",
    "季度",
    "当月YTD",
    "同比YTD",
    "去年同期YTD",
    "预算YTD",
    "预算达成率",
    "环比MTD",
    "当月MTD",
    "上月MTD",
    "月份",
    "实际值",
    "月份排序",
    "结构",
    "结构排序"
   ],
   "route": "#/model/L2-01-02%20%E9%9B%86%E5%9B%A2%E5%90%88%E5%B9%B6%E5%88%A9%E6%B6%A6%E6%B1%87%E6%80%BB%E8%A1%A8"
  },
  {
   "id": "table:L2-01-03 快报-金融投资业务专属",
   "kind": "table",
   "code": "L2-01-03",
   "name": "L2-01-03 快报-金融投资业务专属",
   "text": "语义模型表：L2-01-03 快报-金融投资业务专属（fact）。字段：公司代码、公司代码货币、金融投资产品、加载日期、指标名称、指标值、指标排序、金融投资产品排序、公司代码排序、公司代码货币 级别 01。来源：SAP BW；SharePoint",
   "keywords": [
    "L2-01-03 快报-金融投资业务专属",
    "L2-01-03",
    "公司代码",
    "公司代码货币",
    "金融投资产品",
    "加载日期",
    "指标名称",
    "指标值",
    "指标排序",
    "金融投资产品排序",
    "公司代码排序",
    "公司代码货币 级别 01"
   ],
   "route": "#/model/L2-01-03%20%E5%BF%AB%E6%8A%A5-%E9%87%91%E8%9E%8D%E6%8A%95%E8%B5%84%E4%B8%9A%E5%8A%A1%E4%B8%93%E5%B1%9E"
  },
  {
   "id": "table:L2-01-04 S3 C1成本变化步行图VS上月",
   "kind": "table",
   "code": "L2-01-04",
   "name": "L2-01-04 S3 C1成本变化步行图VS上月",
   "text": "语义模型表：L2-01-04 S3 C1成本变化步行图VS上月（fact）。字段：产品、单位、矿体、指标名称、指标值、加载日期、指标名称排序、产品排序、矿体排序。来源：SAP BW；SharePoint",
   "keywords": [
    "L2-01-04 S3 C1成本变化步行图VS上月",
    "L2-01-04",
    "产品",
    "单位",
    "矿体",
    "指标名称",
    "指标值",
    "加载日期",
    "指标名称排序",
    "产品排序",
    "矿体排序"
   ],
   "route": "#/model/L2-01-04%20S3%20C1%E6%88%90%E6%9C%AC%E5%8F%98%E5%8C%96%E6%AD%A5%E8%A1%8C%E5%9B%BEVS%E4%B8%8A%E6%9C%88"
  },
  {
   "id": "table:L2-01-14 物料单耗月表",
   "kind": "table",
   "code": "L2-01-14",
   "name": "L2-01-14 物料单耗月表",
   "text": "语义模型表：L2-01-14 物料单耗月表（fact）。字段：单位、矿体、加载日期、指标名称、指标值、指标名称排序、单位排序、矿体排序、主要耗材用量、区域排序、生产阶段区域、主要耗材用量排序。来源：SAP BW；SharePoint",
   "keywords": [
    "L2-01-14 物料单耗月表",
    "L2-01-14",
    "单位",
    "矿体",
    "加载日期",
    "指标名称",
    "指标值",
    "指标名称排序",
    "单位排序",
    "矿体排序",
    "主要耗材用量",
    "区域排序",
    "生产阶段区域",
    "主要耗材用量排序"
   ],
   "route": "#/model/L2-01-14%20%E7%89%A9%E6%96%99%E5%8D%95%E8%80%97%E6%9C%88%E8%A1%A8"
  },
  {
   "id": "table:L2-01-25 工序成本完成情况",
   "kind": "table",
   "code": "L2-01-25",
   "name": "L2-01-25 工序成本完成情况",
   "text": "语义模型表：L2-01-25 工序成本完成情况（fact）。字段：大工序、单位、矿体、加载日期、指标名称、指标值、指标名称排序、大工序排序、矿体排序、单位排序、成本指标、成本指标排序、产品。来源：SAP BW；SharePoint",
   "keywords": [
    "L2-01-25 工序成本完成情况",
    "L2-01-25",
    "大工序",
    "单位",
    "矿体",
    "加载日期",
    "指标名称",
    "指标值",
    "指标名称排序",
    "大工序排序",
    "矿体排序",
    "单位排序",
    "成本指标",
    "成本指标排序",
    "产品"
   ],
   "route": "#/model/L2-01-25%20%E5%B7%A5%E5%BA%8F%E6%88%90%E6%9C%AC%E5%AE%8C%E6%88%90%E6%83%85%E5%86%B5"
  },
  {
   "id": "table:L2-03-01 销售管理费用预算执行汇总表",
   "kind": "table",
   "code": "L2-03-01",
   "name": "L2-03-01 销售管理费用预算执行汇总表",
   "text": "语义模型表：L2-03-01 销售管理费用预算执行汇总表（fact）。字段：累计实际、累计预算、销管费分类、加载日期、销管费分类排序、业务板块、业务板块排序。来源：SAP BW；SharePoint",
   "keywords": [
    "L2-03-01 销售管理费用预算执行汇总表",
    "L2-03-01",
    "累计实际",
    "累计预算",
    "销管费分类",
    "加载日期",
    "销管费分类排序",
    "业务板块",
    "业务板块排序"
   ],
   "route": "#/model/L2-03-01%20%E9%94%80%E5%94%AE%E7%AE%A1%E7%90%86%E8%B4%B9%E7%94%A8%E9%A2%84%E7%AE%97%E6%89%A7%E8%A1%8C%E6%B1%87%E6%80%BB%E8%A1%A8"
  },
  {
   "id": "table:L2-03-02 财务费用汇总表",
   "kind": "table",
   "code": "L2-03-02",
   "name": "L2-03-02 财务费用汇总表",
   "text": "语义模型表：L2-03-02 财务费用汇总表（fact）。字段：加载日期、指标名称、指标值、指标排序、结构排序、结构唯一ID、结构。来源：SAP BW；SharePoint",
   "keywords": [
    "L2-03-02 财务费用汇总表",
    "L2-03-02",
    "加载日期",
    "指标名称",
    "指标值",
    "指标排序",
    "结构排序",
    "结构唯一ID",
    "结构"
   ],
   "route": "#/model/L2-03-02%20%E8%B4%A2%E5%8A%A1%E8%B4%B9%E7%94%A8%E6%B1%87%E6%80%BB%E8%A1%A8"
  },
  {
   "id": "table:L2-03-06 矿石成本分析",
   "kind": "table",
   "code": "L2-03-06",
   "name": "L2-03-06 矿石成本分析",
   "text": "语义模型表：L2-03-06 矿石成本分析（fact）。字段：矿体、指标项、加载日期、指标名称、指标值、指标名称排序、矿体排序、指标项排序。来源：SAP BW；SharePoint",
   "keywords": [
    "L2-03-06 矿石成本分析",
    "L2-03-06",
    "矿体",
    "指标项",
    "加载日期",
    "指标名称",
    "指标值",
    "指标名称排序",
    "矿体排序",
    "指标项排序"
   ],
   "route": "#/model/L2-03-06%20%E7%9F%BF%E7%9F%B3%E6%88%90%E6%9C%AC%E5%88%86%E6%9E%90"
  },
  {
   "id": "table:L2-04-01 库存汇总表",
   "kind": "table",
   "code": "L2-04-01",
   "name": "L2-04-01 库存汇总表",
   "text": "语义模型表：L2-04-01 库存汇总表（fact）。字段：分类、结构、矿体、加载日期、分类排序、结构排序、矿体排序、指标名称、矿体v、指标值、口径、口径排序。来源：SAP BW；SharePoint",
   "keywords": [
    "L2-04-01 库存汇总表",
    "L2-04-01",
    "分类",
    "结构",
    "矿体",
    "加载日期",
    "分类排序",
    "结构排序",
    "矿体排序",
    "指标名称",
    "矿体v",
    "指标值",
    "口径",
    "口径排序"
   ],
   "route": "#/model/L2-04-01%20%E5%BA%93%E5%AD%98%E6%B1%87%E6%80%BB%E8%A1%A8"
  },
  {
   "id": "table:L2-05-01 硫磺及硫酸价格分析月报",
   "kind": "table",
   "code": "L2-05-01",
   "name": "L2-05-01 硫磺及硫酸价格分析月报",
   "text": "语义模型表：L2-05-01 硫磺及硫酸价格分析月报（fact）。字段：加载日期、期间名称、期间排序、数据类别、年月、年、月、指标名称、指标值、指标排序、指标单位。来源：SAP BW；SharePoint",
   "keywords": [
    "L2-05-01 硫磺及硫酸价格分析月报",
    "L2-05-01",
    "加载日期",
    "期间名称",
    "期间排序",
    "数据类别",
    "年月",
    "年",
    "月",
    "指标名称",
    "指标值",
    "指标排序",
    "指标单位"
   ],
   "route": "#/model/L2-05-01%20%E7%A1%AB%E7%A3%BA%E5%8F%8A%E7%A1%AB%E9%85%B8%E4%BB%B7%E6%A0%BC%E5%88%86%E6%9E%90%E6%9C%88%E6%8A%A5"
  },
  {
   "id": "table:L2-06-01 主要产品价格波动汇总表",
   "kind": "table",
   "code": "L2-06-01",
   "name": "L2-06-01 主要产品价格波动汇总表",
   "text": "语义模型表：L2-06-01 主要产品价格波动汇总表（fact）。字段：产品、指标名称、加载日期、指标口径、指标值、指标口径排序、指标名称排序、产品排序。来源：SAP BW；SharePoint",
   "keywords": [
    "L2-06-01 主要产品价格波动汇总表",
    "L2-06-01",
    "产品",
    "指标名称",
    "加载日期",
    "指标口径",
    "指标值",
    "指标口径排序",
    "指标名称排序",
    "产品排序"
   ],
   "route": "#/model/L2-06-01%20%E4%B8%BB%E8%A6%81%E4%BA%A7%E5%93%81%E4%BB%B7%E6%A0%BC%E6%B3%A2%E5%8A%A8%E6%B1%87%E6%80%BB%E8%A1%A8"
  },
  {
   "id": "table:Security_Ore_Permission",
   "kind": "table",
   "code": "",
   "name": "Security_Ore_Permission",
   "text": "语义模型表：Security_Ore_Permission（security）。字段：UPN、OreName、IsActive。来源：SharePoint",
   "keywords": [
    "Security_Ore_Permission",
    "",
    "UPN",
    "OreName",
    "IsActive"
   ],
   "route": "#/model/Security_Ore_Permission"
  },
  {
   "id": "table:度量值",
   "kind": "table",
   "code": "",
   "name": "度量值",
   "text": "语义模型表：度量值（measure）。字段：无。来源：DAX",
   "keywords": [
    "度量值",
    ""
   ],
   "route": "#/model/%E5%BA%A6%E9%87%8F%E5%80%BC"
  },
  {
   "id": "table:日期表",
   "kind": "table",
   "code": "",
   "name": "日期表",
   "text": "语义模型表：日期表（dim）。字段：日期、年、月、年月、年排序、月排序、年月筛选。来源：M 生成",
   "keywords": [
    "日期表",
    "",
    "日期",
    "年",
    "月",
    "年月",
    "年排序",
    "月排序",
    "年月筛选"
   ],
   "route": "#/model/%E6%97%A5%E6%9C%9F%E8%A1%A8"
  },
  {
   "id": "table:矿体表",
   "kind": "table",
   "code": "",
   "name": "矿体表",
   "text": "语义模型表：矿体表（dim）。字段：矿体排序、矿体。来源：SharePoint",
   "keywords": [
    "矿体表",
    "",
    "矿体排序",
    "矿体"
   ],
   "route": "#/model/%E7%9F%BF%E4%BD%93%E8%A1%A8"
  },
  {
   "id": "measure:当月YTD",
   "kind": "measure",
   "code": "L2-01-02 集团合并利润汇总表",
   "name": "当月YTD",
   "text": "度量值：当月YTD。DAX：AVERAGE('L2-01-02 集团合并利润汇总表'[当月YTD])。格式：FormatAmount()。分组：L2-01-02 集团合并利润汇总表",
   "keywords": [
    "当月YTD",
    "L2-01-02 集团合并利润汇总表"
   ],
   "route": "#/measures/%E5%BD%93%E6%9C%88YTD"
  },
  {
   "id": "measure:去年同期YTD",
   "kind": "measure",
   "code": "L2-01-02 集团合并利润汇总表",
   "name": "去年同期YTD",
   "text": "度量值：去年同期YTD。DAX：AVERAGE('L2-01-02 集团合并利润汇总表'[去年同期YTD])。格式：FormatAmount()。分组：L2-01-02 集团合并利润汇总表",
   "keywords": [
    "去年同期YTD",
    "L2-01-02 集团合并利润汇总表"
   ],
   "route": "#/measures/%E5%8E%BB%E5%B9%B4%E5%90%8C%E6%9C%9FYTD"
  },
  {
   "id": "measure:预算YTD",
   "kind": "measure",
   "code": "L2-01-02 集团合并利润汇总表",
   "name": "预算YTD",
   "text": "度量值：预算YTD。DAX：AVERAGE('L2-01-02 集团合并利润汇总表'[预算YTD])。格式：FormatAmount()。分组：L2-01-02 集团合并利润汇总表",
   "keywords": [
    "预算YTD",
    "L2-01-02 集团合并利润汇总表"
   ],
   "route": "#/measures/%E9%A2%84%E7%AE%97YTD"
  },
  {
   "id": "measure:当月MTD",
   "kind": "measure",
   "code": "L2-01-02 集团合并利润汇总表",
   "name": "当月MTD",
   "text": "度量值：当月MTD。DAX：AVERAGE('L2-01-02 集团合并利润汇总表'[当月MTD])。格式：FormatAmount()。分组：L2-01-02 集团合并利润汇总表",
   "keywords": [
    "当月MTD",
    "L2-01-02 集团合并利润汇总表"
   ],
   "route": "#/measures/%E5%BD%93%E6%9C%88MTD"
  },
  {
   "id": "measure:上月MTD",
   "kind": "measure",
   "code": "L2-01-02 集团合并利润汇总表",
   "name": "上月MTD",
   "text": "度量值：上月MTD。DAX：AVERAGE('L2-01-02 集团合并利润汇总表'[上月MTD])。格式：FormatAmount()。分组：L2-01-02 集团合并利润汇总表",
   "keywords": [
    "上月MTD",
    "L2-01-02 集团合并利润汇总表"
   ],
   "route": "#/measures/%E4%B8%8A%E6%9C%88MTD"
  },
  {
   "id": "measure:实际值",
   "kind": "measure",
   "code": "L2-01-02 集团合并利润汇总表",
   "name": "实际值",
   "text": "度量值：实际值。DAX：SUM('L2-01-02 集团合并利润汇总表'[实际值])。格式：FormatAmount()。分组：L2-01-02 集团合并利润汇总表",
   "keywords": [
    "实际值",
    "L2-01-02 集团合并利润汇总表"
   ],
   "route": "#/measures/%E5%AE%9E%E9%99%85%E5%80%BC"
  },
  {
   "id": "measure:同比YTD",
   "kind": "measure",
   "code": "L2-01-02 集团合并利润汇总表",
   "name": "同比YTD",
   "text": "度量值：同比YTD。DAX：AVERAGE('L2-01-02 集团合并利润汇总表'[同比YTD])。格式：FormatRatio()。分组：L2-01-02 集团合并利润汇总表",
   "keywords": [
    "同比YTD",
    "L2-01-02 集团合并利润汇总表"
   ],
   "route": "#/measures/%E5%90%8C%E6%AF%94YTD"
  },
  {
   "id": "measure:预算达成率",
   "kind": "measure",
   "code": "L2-01-02 集团合并利润汇总表",
   "name": "预算达成率",
   "text": "度量值：预算达成率。DAX：AVERAGE('L2-01-02 集团合并利润汇总表'[预算达成率])。格式：FormatRatio()。分组：L2-01-02 集团合并利润汇总表",
   "keywords": [
    "预算达成率",
    "L2-01-02 集团合并利润汇总表"
   ],
   "route": "#/measures/%E9%A2%84%E7%AE%97%E8%BE%BE%E6%88%90%E7%8E%87"
  },
  {
   "id": "measure:环比MTD",
   "kind": "measure",
   "code": "L2-01-02 集团合并利润汇总表",
   "name": "环比MTD",
   "text": "度量值：环比MTD。DAX：AVERAGE('L2-01-02 集团合并利润汇总表'[环比MTD])。格式：FormatRatio()。分组：L2-01-02 集团合并利润汇总表",
   "keywords": [
    "环比MTD",
    "L2-01-02 集团合并利润汇总表"
   ],
   "route": "#/measures/%E7%8E%AF%E6%AF%94MTD"
  },
  {
   "id": "measure:累计实际",
   "kind": "measure",
   "code": "L2-03-01 销售管理费用预算执行汇总表",
   "name": "累计实际",
   "text": "度量值：累计实际。DAX：SUM('L2-03-01 销售管理费用预算执行汇总表'[累计实际])/1000。格式：FormatAmount()。分组：L2-03-01 销售管理费用预算执行汇总表",
   "keywords": [
    "累计实际",
    "L2-03-01 销售管理费用预算执行汇总表"
   ],
   "route": "#/measures/%E7%B4%AF%E8%AE%A1%E5%AE%9E%E9%99%85"
  },
  {
   "id": "measure:累计预算",
   "kind": "measure",
   "code": "L2-03-01 销售管理费用预算执行汇总表",
   "name": "累计预算",
   "text": "度量值：累计预算。DAX：SUM('L2-03-01 销售管理费用预算执行汇总表'[累计预算])。格式：FormatAmount()。分组：L2-03-01 销售管理费用预算执行汇总表",
   "keywords": [
    "累计预算",
    "L2-03-01 销售管理费用预算执行汇总表"
   ],
   "route": "#/measures/%E7%B4%AF%E8%AE%A1%E9%A2%84%E7%AE%97"
  },
  {
   "id": "measure:累计执行%",
   "kind": "measure",
   "code": "L2-03-01 销售管理费用预算执行汇总表",
   "name": "累计执行%",
   "text": "度量值：累计执行%。DAX：DIVIDE([累计实际], [累计预算], 0)。格式：FormatRatio()。分组：L2-03-01 销售管理费用预算执行汇总表",
   "keywords": [
    "累计执行%",
    "L2-03-01 销售管理费用预算执行汇总表"
   ],
   "route": "#/measures/%E7%B4%AF%E8%AE%A1%E6%89%A7%E8%A1%8C%25"
  },
  {
   "id": "measure:L2-03-02指标值",
   "kind": "measure",
   "code": "L2-03-02 财务费用汇总表",
   "name": "L2-03-02指标值",
   "text": "度量值：L2-03-02指标值。DAX：SUM('L2-03-02 财务费用汇总表'[指标值])。格式：FormatAmount()。分组：L2-03-02 财务费用汇总表",
   "keywords": [
    "L2-03-02指标值",
    "L2-03-02 财务费用汇总表"
   ],
   "route": "#/measures/L2-03-02%E6%8C%87%E6%A0%87%E5%80%BC"
  },
  {
   "id": "measure:L2-01-03指标值",
   "kind": "measure",
   "code": "L2-01-03 快报-金融投资业务专属",
   "name": "L2-01-03指标值",
   "text": "度量值：L2-01-03指标值。DAX：SUM('L2-01-03 快报-金融投资业务专属'[指标值])。格式：FormatAmount()。分组：L2-01-03 快报-金融投资业务专属",
   "keywords": [
    "L2-01-03指标值",
    "L2-01-03 快报-金融投资业务专属"
   ],
   "route": "#/measures/L2-01-03%E6%8C%87%E6%A0%87%E5%80%BC"
  },
  {
   "id": "measure:金额(人民币)",
   "kind": "measure",
   "code": "L2-04-01 库存汇总表",
   "name": "金额(人民币)",
   "text": "度量值：金额(人民币)。DAX：CALCULATE(SUM('L2-04-01 库存汇总表'[指标值]), 'L2-04-01 库存汇总表'[指标名称] = \"金额(人民币)\")。格式：FormatAmount()。分组：L2-04-01 库存汇总表",
   "keywords": [
    "金额(人民币)",
    "L2-04-01 库存汇总表"
   ],
   "route": "#/measures/%E9%87%91%E9%A2%9D%28%E4%BA%BA%E6%B0%91%E5%B8%81%29"
  },
  {
   "id": "measure:量(吨)",
   "kind": "measure",
   "code": "L2-04-01 库存汇总表",
   "name": "量(吨)",
   "text": "度量值：量(吨)。DAX：CALCULATE(SUM('L2-04-01 库存汇总表'[指标值]), 'L2-04-01 库存汇总表'[指标名称] = \"量(吨)\")。格式：FormatAmount()。分组：L2-04-01 库存汇总表",
   "keywords": [
    "量(吨)",
    "L2-04-01 库存汇总表"
   ],
   "route": "#/measures/%E9%87%8F%28%E5%90%A8%29"
  },
  {
   "id": "measure:L2-05-01指标值",
   "kind": "measure",
   "code": "L2-05-01 硫磺及硫酸价格分析月报",
   "name": "L2-05-01指标值",
   "text": "度量值：L2-05-01指标值。DAX：SUM('L2-05-01 硫磺及硫酸价格分析月报'[指标值])。格式：FormatAmount()。分组：L2-05-01 硫磺及硫酸价格分析月报",
   "keywords": [
    "L2-05-01指标值",
    "L2-05-01 硫磺及硫酸价格分析月报"
   ],
   "route": "#/measures/L2-05-01%E6%8C%87%E6%A0%87%E5%80%BC"
  },
  {
   "id": "measure:L2-01-04指标值",
   "kind": "measure",
   "code": "L2-01-04 S3 C1成本变化步行图VS上月",
   "name": "L2-01-04指标值",
   "text": "度量值：L2-01-04指标值。DAX：SUM('L2-01-04 S3 C1成本变化步行图VS上月'[指标值])。格式：FormatAmount()。分组：L2-01-04 S3 C1成本变化步行图VS上月",
   "keywords": [
    "L2-01-04指标值",
    "L2-01-04 S3 C1成本变化步行图VS上月"
   ],
   "route": "#/measures/L2-01-04%E6%8C%87%E6%A0%87%E5%80%BC"
  },
  {
   "id": "measure:L2-01-14指标值",
   "kind": "measure",
   "code": "L2-01-14 物料单耗月表",
   "name": "L2-01-14指标值",
   "text": "度量值：L2-01-14指标值。DAX：SUM('L2-01-14 物料单耗月表'[指标值])。格式：FormatAmount()。分组：L2-01-14 物料单耗月表",
   "keywords": [
    "L2-01-14指标值",
    "L2-01-14 物料单耗月表"
   ],
   "route": "#/measures/L2-01-14%E6%8C%87%E6%A0%87%E5%80%BC"
  },
  {
   "id": "measure:L2-01-25指标值",
   "kind": "measure",
   "code": "L2-01-25 工序成本完成情况",
   "name": "L2-01-25指标值",
   "text": "度量值：L2-01-25指标值。DAX：SUM('L2-01-25 工序成本完成情况'[指标值])。格式：FormatAmount()。分组：L2-01-25 工序成本完成情况",
   "keywords": [
    "L2-01-25指标值",
    "L2-01-25 工序成本完成情况"
   ],
   "route": "#/measures/L2-01-25%E6%8C%87%E6%A0%87%E5%80%BC"
  },
  {
   "id": "measure:L2-03-06指标值",
   "kind": "measure",
   "code": "L2-03-06 矿石成本分析",
   "name": "L2-03-06指标值",
   "text": "度量值：L2-03-06指标值。DAX：SUM('L2-03-06 矿石成本分析'[指标值])。格式：FormatAmount()。分组：L2-03-06 矿石成本分析",
   "keywords": [
    "L2-03-06指标值",
    "L2-03-06 矿石成本分析"
   ],
   "route": "#/measures/L2-03-06%E6%8C%87%E6%A0%87%E5%80%BC"
  },
  {
   "id": "measure:L2-06-01指标值",
   "kind": "measure",
   "code": "L2-06-01 主要产品价格波动汇总表",
   "name": "L2-06-01指标值",
   "text": "度量值：L2-06-01指标值。DAX：SUM('L2-06-01 主要产品价格波动汇总表'[指标值])。格式：FormatAmount()。分组：L2-06-01 主要产品价格波动汇总表",
   "keywords": [
    "L2-06-01指标值",
    "L2-06-01 主要产品价格波动汇总表"
   ],
   "route": "#/measures/L2-06-01%E6%8C%87%E6%A0%87%E5%80%BC"
  },
  {
   "id": "measure:当前月报期间",
   "kind": "measure",
   "code": "辅助",
   "name": "当前月报期间",
   "text": "度量值：当前月报期间。DAX：VAR _Date = MAX('日期表'[日期])\nVAR _YearMonth = FORMAT(_Date,\"yyyy年MM月\")\nRETURN\n\"当前月报期间: \" & _YearMonth。格式：—。分组：辅助",
   "keywords": [
    "当前月报期间",
    "辅助"
   ],
   "route": "#/measures/%E5%BD%93%E5%89%8D%E6%9C%88%E6%8A%A5%E6%9C%9F%E9%97%B4"
  },
  {
   "id": "measure:金额(原币)",
   "kind": "measure",
   "code": "L2-04-01 库存汇总表",
   "name": "金额(原币)",
   "text": "度量值：金额(原币)。DAX：CALCULATE(SUM('L2-04-01 库存汇总表'[指标值]), 'L2-04-01 库存汇总表'[指标名称] = \"金额(原币)\")。格式：FormatAmount()。分组：L2-04-01 库存汇总表",
   "keywords": [
    "金额(原币)",
    "L2-04-01 库存汇总表"
   ],
   "route": "#/measures/%E9%87%91%E9%A2%9D%28%E5%8E%9F%E5%B8%81%29"
  },
  {
   "id": "page:L2-01-02",
   "kind": "page",
   "code": "L2-01-02",
   "name": "L2-01-02 集团合并利润汇总表",
   "text": "报表页：L2-01-02 集团合并利润汇总表（L2-01-02）。视觉对象：slicer、pivotTable、card、textbox。引用表：L2-01-02 集团合并利润汇总表、日期表",
   "keywords": [
    "L2-01-02 集团合并利润汇总表",
    "L2-01-02",
    "同比YTD",
    "实际值",
    "当前月报期间",
    "当月YTD",
    "环比MTD",
    "预算YTD",
    "预算达成率"
   ],
   "route": "#/page/L2-01-02"
  },
  {
   "id": "page:L2-01-03",
   "kind": "page",
   "code": "L2-01-03",
   "name": "L2-01-03 快报-金融投资业务专属",
   "text": "报表页：L2-01-03 快报-金融投资业务专属（L2-01-03）。视觉对象：slicer、card、pivotTable、textbox。引用表：L2-01-03 快报-金融投资业务专属、日期表",
   "keywords": [
    "L2-01-03 快报-金融投资业务专属",
    "L2-01-03",
    "L2-01-03指标值",
    "当前月报期间"
   ],
   "route": "#/page/L2-01-03"
  },
  {
   "id": "page:L2-01-04",
   "kind": "page",
   "code": "L2-01-04",
   "name": "L2-01-04 S3 C1成本变化步行图VS上月",
   "text": "报表页：L2-01-04 S3 C1成本变化步行图VS上月（L2-01-04）。视觉对象：slicer、textbox、card、pivotTable。引用表：L2-01-04 S3 C1成本变化步行图VS上月、日期表",
   "keywords": [
    "L2-01-04 S3 C1成本变化步行图VS上月",
    "L2-01-04",
    "L2-01-04指标值",
    "当前月报期间"
   ],
   "route": "#/page/L2-01-04"
  },
  {
   "id": "page:L2-01-14",
   "kind": "page",
   "code": "L2-01-14",
   "name": "L2-01-14 物料单耗月表",
   "text": "报表页：L2-01-14 物料单耗月表（L2-01-14）。视觉对象：slicer、pivotTable、textbox、card。引用表：L2-01-14 物料单耗月表、日期表",
   "keywords": [
    "L2-01-14 物料单耗月表",
    "L2-01-14",
    "L2-01-14指标值",
    "当前月报期间"
   ],
   "route": "#/page/L2-01-14"
  },
  {
   "id": "page:L2-01-25",
   "kind": "page",
   "code": "L2-01-25",
   "name": "L2-01-25 工序成本完成情况",
   "text": "报表页：L2-01-25 工序成本完成情况（L2-01-25）。视觉对象：card、slicer、textbox、pivotTable。引用表：L2-01-25 工序成本完成情况、日期表",
   "keywords": [
    "L2-01-25 工序成本完成情况",
    "L2-01-25",
    "L2-01-25指标值",
    "当前月报期间"
   ],
   "route": "#/page/L2-01-25"
  },
  {
   "id": "page:L2-03-01",
   "kind": "page",
   "code": "L2-03-01",
   "name": "L2-03-01 销售管理费用预算执行汇总表",
   "text": "报表页：L2-03-01 销售管理费用预算执行汇总表（L2-03-01）。视觉对象：pivotTable、textbox、slicer、card。引用表：L2-03-01 销售管理费用预算执行汇总表、日期表",
   "keywords": [
    "L2-03-01 销售管理费用预算执行汇总表",
    "L2-03-01",
    "当前月报期间",
    "累计实际",
    "累计执行%",
    "累计预算"
   ],
   "route": "#/page/L2-03-01"
  },
  {
   "id": "page:L2-03-02",
   "kind": "page",
   "code": "L2-03-02",
   "name": "L2-03-02 财务费用汇总表",
   "text": "报表页：L2-03-02 财务费用汇总表（L2-03-02）。视觉对象：card、textbox、slicer、pivotTable。引用表：L2-03-02 财务费用汇总表、日期表",
   "keywords": [
    "L2-03-02 财务费用汇总表",
    "L2-03-02",
    "当前月报期间",
    "指标值"
   ],
   "route": "#/page/L2-03-02"
  },
  {
   "id": "page:L2-03-06",
   "kind": "page",
   "code": "L2-03-06",
   "name": "L2-03-06 矿石成本分析",
   "text": "报表页：L2-03-06 矿石成本分析（L2-03-06）。视觉对象：card、slicer、textbox、pivotTable。引用表：L2-03-06 矿石成本分析、日期表",
   "keywords": [
    "L2-03-06 矿石成本分析",
    "L2-03-06",
    "L2-03-06指标值",
    "当前月报期间"
   ],
   "route": "#/page/L2-03-06"
  },
  {
   "id": "page:L2-04-01",
   "kind": "page",
   "code": "L2-04-01",
   "name": "L2-04-01库存汇总表",
   "text": "报表页：L2-04-01库存汇总表（L2-04-01）。视觉对象：slicer、pivotTable、textbox、card。引用表：L2-04-01 库存汇总表、日期表",
   "keywords": [
    "L2-04-01库存汇总表",
    "L2-04-01",
    "当前月报期间",
    "量(吨)",
    "金额(人民币)",
    "金额(原币)"
   ],
   "route": "#/page/L2-04-01"
  },
  {
   "id": "page:L2-05-01",
   "kind": "page",
   "code": "L2-05-01",
   "name": "L2-05-01 硫磺及硫酸价格分析月报",
   "text": "报表页：L2-05-01 硫磺及硫酸价格分析月报（L2-05-01）。视觉对象：pivotTable、textbox、card、slicer。引用表：L2-05-01 硫磺及硫酸价格分析月报、日期表",
   "keywords": [
    "L2-05-01 硫磺及硫酸价格分析月报",
    "L2-05-01",
    "L2-05-01指标值",
    "当前月报期间"
   ],
   "route": "#/page/L2-05-01"
  },
  {
   "id": "page:L2-06-01",
   "kind": "page",
   "code": "L2-06-01",
   "name": "L2-06-01 主要产品价格波动汇总表",
   "text": "报表页：L2-06-01 主要产品价格波动汇总表（L2-06-01）。视觉对象：pivotTable、card、textbox、slicer。引用表：L2-06-01 主要产品价格波动汇总表、日期表",
   "keywords": [
    "L2-06-01 主要产品价格波动汇总表",
    "L2-06-01",
    "L2-06-01指标值",
    "当前月报期间"
   ],
   "route": "#/page/L2-06-01"
  },
  {
   "id": "mapping:L2-01-02 集团合并利润汇总表指标映射",
   "kind": "mapping",
   "code": "L2-01-02",
   "name": "L2-01-02 集团合并利润汇总表指标映射",
   "text": "指标映射：L2-01-02 集团合并利润汇总表指标映射（L2-01-02）。工作表：结构排序、指标颜色配置。文件：deliverables/mappings/L2-01-02 集团合并利润汇总表指标映射.xlsx",
   "keywords": [
    "L2-01-02 集团合并利润汇总表指标映射",
    "L2-01-02"
   ],
   "route": "#/mappings/L2-01-02"
  },
  {
   "id": "mapping:L2-01-03 快报-金融投资业务专属指标映射",
   "kind": "mapping",
   "code": "L2-01-03",
   "name": "L2-01-03 快报-金融投资业务专属指标映射",
   "text": "指标映射：L2-01-03 快报-金融投资业务专属指标映射（L2-01-03）。工作表：指标排序、金融投资产品排序、公司代码排序。文件：deliverables/mappings/L2-01-03 快报-金融投资业务专属指标映射.xlsx",
   "keywords": [
    "L2-01-03 快报-金融投资业务专属指标映射",
    "L2-01-03"
   ],
   "route": "#/mappings/L2-01-03"
  },
  {
   "id": "mapping:L2-01-04 S3 C1成本变化步行图VS上月指标映射",
   "kind": "mapping",
   "code": "L2-01-04",
   "name": "L2-01-04 S3 C1成本变化步行图VS上月指标映射",
   "text": "指标映射：L2-01-04 S3 C1成本变化步行图VS上月指标映射（L2-01-04）。工作表：产品排序、矿体排序、指标名称排序。文件：deliverables/mappings/L2-01-04 S3 C1成本变化步行图VS上月指标映射.xlsx",
   "keywords": [
    "L2-01-04 S3 C1成本变化步行图VS上月指标映射",
    "L2-01-04"
   ],
   "route": "#/mappings/L2-01-04"
  },
  {
   "id": "mapping:L2-01-14 物料单耗月表指标映射",
   "kind": "mapping",
   "code": "L2-01-14",
   "name": "L2-01-14 物料单耗月表指标映射",
   "text": "指标映射：L2-01-14 物料单耗月表指标映射（L2-01-14）。工作表：单位排序、矿体排序、区域排序、指标名称排序。文件：deliverables/mappings/L2-01-14 物料单耗月表指标映射.xlsx",
   "keywords": [
    "L2-01-14 物料单耗月表指标映射",
    "L2-01-14"
   ],
   "route": "#/mappings/L2-01-14"
  },
  {
   "id": "mapping:L2-01-25 工序成本完成情况指标映射",
   "kind": "mapping",
   "code": "L2-01-25",
   "name": "L2-01-25 工序成本完成情况指标映射",
   "text": "指标映射：L2-01-25 工序成本完成情况指标映射（L2-01-25）。工作表：大工序排序、矿体排序、单位排序、指标名称排序、成本指标排序。文件：deliverables/mappings/L2-01-25 工序成本完成情况指标映射.xlsx",
   "keywords": [
    "L2-01-25 工序成本完成情况指标映射",
    "L2-01-25"
   ],
   "route": "#/mappings/L2-01-25"
  },
  {
   "id": "mapping:L2-03-01 销售管理费用预算执行汇总表指标映射",
   "kind": "mapping",
   "code": "L2-03-01",
   "name": "L2-03-01 销售管理费用预算执行汇总表指标映射",
   "text": "指标映射：L2-03-01 销售管理费用预算执行汇总表指标映射（L2-03-01）。工作表：销管费分类排序、管理口径利润中心排序、业务板块映射。文件：deliverables/mappings/L2-03-01 销售管理费用预算执行汇总表指标映射.xlsx",
   "keywords": [
    "L2-03-01 销售管理费用预算执行汇总表指标映射",
    "L2-03-01"
   ],
   "route": "#/mappings/L2-03-01"
  },
  {
   "id": "mapping:L2-03-02 财务费用汇总表指标映射",
   "kind": "mapping",
   "code": "L2-03-02",
   "name": "L2-03-02 财务费用汇总表指标映射",
   "text": "指标映射：L2-03-02 财务费用汇总表指标映射（L2-03-02）。工作表：指标排序、结构排序。文件：deliverables/mappings/L2-03-02 财务费用汇总表指标映射.xlsx",
   "keywords": [
    "L2-03-02 财务费用汇总表指标映射",
    "L2-03-02"
   ],
   "route": "#/mappings/L2-03-02"
  },
  {
   "id": "mapping:L2-03-06 矿石成本分析指标映射",
   "kind": "mapping",
   "code": "L2-03-06",
   "name": "L2-03-06 矿石成本分析指标映射",
   "text": "指标映射：L2-03-06 矿石成本分析指标映射（L2-03-06）。工作表：矿体排序、指标项排序、指标名称排序。文件：deliverables/mappings/L2-03-06 矿石成本分析指标映射.xlsx",
   "keywords": [
    "L2-03-06 矿石成本分析指标映射",
    "L2-03-06"
   ],
   "route": "#/mappings/L2-03-06"
  },
  {
   "id": "mapping:L2-04-01库存汇总表指标映射",
   "kind": "mapping",
   "code": "L2-04-01",
   "name": "L2-04-01库存汇总表指标映射",
   "text": "指标映射：L2-04-01库存汇总表指标映射（L2-04-01）。工作表：分类排序、结构排序、矿体排序。文件：deliverables/mappings/L2-04-01库存汇总表指标映射.xlsx",
   "keywords": [
    "L2-04-01库存汇总表指标映射",
    "L2-04-01"
   ],
   "route": "#/mappings/L2-04-01"
  },
  {
   "id": "mapping:L2-05-01 硫磺及硫酸价格分析月报指标映射",
   "kind": "mapping",
   "code": "L2-05-01",
   "name": "L2-05-01 硫磺及硫酸价格分析月报指标映射",
   "text": "指标映射：L2-05-01 硫磺及硫酸价格分析月报指标映射（L2-05-01）。工作表：指标排序。文件：deliverables/mappings/L2-05-01 硫磺及硫酸价格分析月报指标映射.xlsx",
   "keywords": [
    "L2-05-01 硫磺及硫酸价格分析月报指标映射",
    "L2-05-01"
   ],
   "route": "#/mappings/L2-05-01"
  },
  {
   "id": "mapping:L2-06-01 主要产品价格波动汇总表指标映射",
   "kind": "mapping",
   "code": "L2-06-01",
   "name": "L2-06-01 主要产品价格波动汇总表指标映射",
   "text": "指标映射：L2-06-01 主要产品价格波动汇总表指标映射（L2-06-01）。工作表：产品排序、指标名称排序、指标口径排序。文件：deliverables/mappings/L2-06-01 主要产品价格波动汇总表指标映射.xlsx",
   "keywords": [
    "L2-06-01 主要产品价格波动汇总表指标映射",
    "L2-06-01"
   ],
   "route": "#/mappings/L2-06-01"
  },
  {
   "id": "mapping:Security_Ore_Permission",
   "kind": "mapping",
   "code": "",
   "name": "Security_Ore_Permission",
   "text": "指标映射：Security_Ore_Permission（）。工作表：Security_Ore_Permission。文件：deliverables/mappings/Security_Ore_Permission.xlsx",
   "keywords": [
    "Security_Ore_Permission",
    ""
   ],
   "route": "#/mappings/"
  },
  {
   "id": "mapping:维度表",
   "kind": "mapping",
   "code": "",
   "name": "维度表",
   "text": "指标映射：维度表（）。工作表：矿体。文件：deliverables/mappings/维度表.xlsx",
   "keywords": [
    "维度表",
    ""
   ],
   "route": "#/mappings/"
  }
 ]
};

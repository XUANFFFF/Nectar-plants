import { Download, FileText, BookOpen, Search } from "lucide-react";

// ponytail: static mock entries, replace with real upload/download when CMS available
const resources = [
  {
    title: "深圳城市绿地传粉动物公民科学项目年度报告（2025）",
    type: "年度报告",
    icon: FileText,
    url: null,
    description: "项目年度成果汇总，包含数据概览、关键发现、社会影响分析和未来展望。",
  },
  {
    title: "BioGrid 使用指南",
    type: "使用说明",
    icon: BookOpen,
    url: null,
    description: "如何使用 BioGrid 平台上传观察记录、管理数据和参与公民科学项目。",
  },
  {
    title: "常见蜜源植物图鉴",
    type: "参考资料",
    icon: Search,
    url: null,
    description: "华南地区常见蜜源植物的识别特征、花期和访花动物信息汇总。",
  },
  {
    title: "常见访花动物识别手册",
    type: "参考资料",
    icon: Search,
    url: null,
    description: "蜜蜂、蝴蝶、甲虫等常见传粉动物的识别特征和行为简介。",
  },
  {
    title: "名词解释",
    type: "参考资料",
    icon: BookOpen,
    url: null,
    description: "项目涉及的专业术语解释，包括蜜源植物、传粉动物、访花网络等。",
  },
];

export function ResourceLibrary() {
  return (
    <>
      <div className="section-heading">
        <span className="eyebrow">
          <Download size={12} style={{ verticalAlign: "-1px", marginRight: 2 }} /> 资料库
        </span>
        <h2>历年报告与参考资料</h2>
        <p>项目报告、使用指南和识别手册，帮助参与者更好地了解和参与公民科学项目。</p>
      </div>

      <div className="resource-grid">
        {resources.map((item) => (
          <div className="resource-card" key={item.title}>
            <div className="resource-type">{item.type}</div>
            <item.icon className="resource-icon" size={20} />
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <div className="resource-action">
              {item.url ? (
                <a href={item.url} className="resource-download" download>
                  <Download size={14} /> 下载
                </a>
              ) : (
                <span className="resource-placeholder">即将上线</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

import { BookOpen, FileText, Users, Sprout } from "lucide-react";

const expertInsights = [
  {
    title: "数据概览",
    date: "2025 年 6 月",
    content:
      "深圳城市绿地传粉动物公民科学项目自启动以来，已累计收集 200 条蜜源植物观察记录，覆盖深圳、广州、珠海、东莞 4 个城市的 32 个区县。共记录 25 种蜜源植物，隶属 19 个科，观察到蜜蜂、蝴蝶、甲虫等多个传粉动物类群。",
  },
  {
    title: "关键发现",
    date: "2025 年 6 月",
    content:
      "初步分析显示，深圳城市绿地中人工养育的蜜源植物（如马缨丹、假马鞭、马利筋）吸引了大量传粉昆虫，包括东方蜜蜂、金斑蝶、巴黎翠凤蝶等。野生蜜源植物（如白花鬼针草、蟛蜞菊）在龙岗区、大鹏新区的自然绿地中表现出较高的传粉网络多样性。",
  },
  {
    title: "访花网络分析",
    date: "2025 年 6 月",
    content:
      "当前数据共记录了 40+ 种植物-昆虫关联对。假马鞭和蟛蜞菊是深圳龙岗区访花频率最高的植物，吸引了蜜蜂属、彩带蜂属、蛱蝶科等多个传粉类群。这一模式提示：在城市绿地中配置特定蜜源植物可有效提升传粉服务功能。",
  },
];

const achievements = [
  {
    icon: Users,
    title: "市民志愿者参与",
    desc: "19 位市民志愿者参与了数据采集，累计提交 200 条观察记录。",
  },
  {
    icon: Sprout,
    title: "传粉动物友好花园改造",
    desc: "在深圳龙岗区、罗湖区、福田区识别出 100+ 个蜜源观察场域，为后续花园改造提供基线数据。",
  },
  {
    icon: BookOpen,
    title: "科学传播活动",
    desc: "通过 BioGrid 平台和线下工作坊，向公众普及城市传粉动物保护知识。",
  },
  {
    icon: FileText,
    title: "合作网络",
    desc: "依托 BioGrid 平台，联合科研机构、社区组织和高校志愿者共同推进城市传粉动物监测。",
  },
];

export function ExpertInterpretation() {
  return (
    <>
      <div className="section-heading">
        <span className="eyebrow">
          <BookOpen size={12} style={{ verticalAlign: "-1px", marginRight: 2 }} /> 专家解读
        </span>
        <h2>阶段性发现与分析</h2>
        <p>
          以下内容由项目团队基于当前数据初步解读，不代表正式科学结论。
          实时数据与专家确认结论之间存在明确边界。
        </p>
      </div>

      <div className="insight-list">
        {expertInsights.map((item) => (
          <article className="insight-card" key={item.title}>
            <div className="insight-header">
              <h3>{item.title}</h3>
              <span className="insight-date">{item.date}</span>
            </div>
            <p>{item.content}</p>
          </article>
        ))}
      </div>

      <div className="section-heading" style={{ marginTop: 48 }}>
        <span className="eyebrow">
          <Users size={12} style={{ verticalAlign: "-1px", marginRight: 2 }} /> 项目成果
        </span>
        <h2>社会影响与合作网络</h2>
        <p>公民科学项目在公众参与、科学传播和城市生态保护方面的初步成效。</p>
      </div>

      <div className="achievement-grid">
        {achievements.map((item) => (
          <div className="achievement-card" key={item.title}>
            <item.icon className="achievement-icon" size={24} />
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="disclaimer-banner">
        <Sprout size={14} />
        <span>
          以上内容基于 demo 数据的初步分析。年度正式报告将由项目专家团队撰写，
          包含完整的数据分析、科学结论和管理建议。
        </span>
      </div>
    </>
  );
}

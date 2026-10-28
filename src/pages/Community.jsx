import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PageMeta from "../components/PageMeta.jsx";
import { setAmbientScene } from "../audio/sound.js";
import Newsroom from "../components/community/Newsroom.jsx";
import Forum from "../components/community/Forum.jsx";
import WikiWire from "../components/community/WikiWire.jsx";
import BreakRoom from "../components/community/BreakRoom.jsx";

const TABS = [
  {
    id: "news",
    label: "Newsroom",
    icon: "📰",
    hint: "Headlines, source links and the creator video desk.",
  },
  {
    id: "forum",
    label: "Forum",
    icon: "💬",
    hint: "Browser-local threads, replies, polls and tier lists.",
  },
  {
    id: "chat",
    label: "Break Room",
    icon: "☕",
    hint: "Live shift chat — open tabs talk to each other.",
  },
  {
    id: "wire",
    label: "Wiki Wire",
    icon: "📡",
    hint: "Live edits from the wider Fandom community.",
  },
];

const TAB_IDS = TABS.map((tab) => tab.id);

const COMMUNITY_SCHEMA = {
  "@type": "CollectionPage",
  name: "Community — FNAF Wiki",
  description:
    "FNAF news, creator videos, browser-local discussion threads and live Fandom wiki activity.",
  about: ["Five Nights at Freddy's", "fan community", "news", "discussion"],
};

export default function Community() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get("tab");
  const tab = TAB_IDS.includes(requested) ? requested : "news";
  const active = TABS.find((item) => item.id === tab);

  /* The newsroom gets a quiet dispatch-desk room tone. */
  useEffect(() => {
    setAmbientScene("community");
    return () => setAmbientScene("site");
  }, []);

  const changeTab = (id) => {
    setSearchParams(id === "news" ? {} : { tab: id }, { replace: true });
  };

  const onTabKeyDown = (event, index) => {
    let nextIndex = null;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % TABS.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + TABS.length) % TABS.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = TABS.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    const next = TABS[nextIndex];
    changeTab(next.id);
    requestAnimationFrame(() => document.getElementById(`community-tab-${next.id}`)?.focus());
  };

  return (
    <div className="page community-hub">
      <PageMeta
        title="Community"
        description="The FNAF Wiki community desk: source-linked news, creator videos, browser-local forum threads, polls, tier lists and live Fandom wiki activity."
        keywords="FNAF news, FNAF forum, FNAF community, Five Nights at Freddy's theories"
        schema={COMMUNITY_SCHEMA}
      />

      <header className="community-hero">
        <div>
          <span className="hub-kicker">Fazbear Entertainment · public access</span>
          <h1 className="page-title">Community</h1>
          <p className="page-subtitle">
            Four desks, one night shift. Read the news, trade theories in the forum, talk to the
            other tabs in the break room, or watch the wider Fandom wiki move in real time.
          </p>
        </div>
        <div className="community-hero-stamp" aria-hidden="true">
          <span>NIGHT</span>
          <b>03</b>
          <small>COMMUNITY DESK</small>
        </div>
      </header>

      <div className="community-tabs" role="tablist" aria-label="Community sections">
        {TABS.map((item, index) => (
          <button
            type="button"
            key={item.id}
            id={`community-tab-${item.id}`}
            role="tab"
            aria-selected={tab === item.id}
            aria-controls={`community-panel-${item.id}`}
            tabIndex={tab === item.id ? 0 : -1}
            className={`community-tab ${tab === item.id ? "is-active" : ""}`}
            onClick={() => changeTab(item.id)}
            onKeyDown={(event) => onTabKeyDown(event, index)}
          >
            <span className="community-tab-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span>
              <strong>{item.label}</strong>
              <small>{item.hint}</small>
            </span>
          </button>
        ))}
      </div>

      <div
        className="community-panel"
        id={`community-panel-${active.id}`}
        role="tabpanel"
        aria-labelledby={`community-tab-${active.id}`}
        tabIndex={0}
      >
        {tab === "news" && <Newsroom />}
        {tab === "forum" && <Forum />}
        {tab === "chat" && <BreakRoom />}
        {tab === "wire" && <WikiWire />}
      </div>
    </div>
  );
}

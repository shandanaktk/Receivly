const stories = [
  { image: "/images/story-2.webp", number: "01", title: "Start with the full picture", body: "See customers, invoices, and the details behind every balance." },
  { image: "/images/story-3.webp", number: "02", title: "Make each follow-up count", body: "Build a thoughtful rhythm around real amounts and due dates." },
  { image: "/images/story-4.webp", number: "03", title: "Turn data into decisions", body: "Understand what is moving, what is overdue, and what needs you." },
  { image: "/images/story-1.webp", number: "04", title: "Keep the work connected", body: "From an invoice sent to a promise made, nothing gets lost." },
  { image: "/images/story-5.webp", number: "05", title: "Close the loop clearly", body: "Verified payments and a complete timeline help teams move forward." },
];

function StoryGroup({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <div className="story-marquee-group" aria-hidden={duplicate || undefined}>
      {stories.map((story) => (
        <article key={`${duplicate ? "copy" : "original"}-${story.number}`} className="story-card group relative h-[430px] w-[86vw] max-w-[540px] shrink-0 overflow-hidden rounded-[1.75rem] border border-white/15 bg-[#111184] shadow-[0_24px_70px_rgba(17,17,132,.24)] transition-[transform,box-shadow] duration-500 ease-out sm:h-[470px] sm:w-[54vw] lg:w-[39vw] xl:w-[35vw]" tabIndex={duplicate ? -1 : 0}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={story.image} alt="" loading="lazy" width={1200} height={800} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06] group-focus:scale-[1.06]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,17,132,.27)_0%,rgba(17,17,132,.42)_38%,rgba(7,7,55,.96)_100%)]" />
          <div className="absolute inset-4 rounded-[1.15rem] border border-white/30" />
          <div className="absolute inset-x-8 top-8 flex items-center justify-between text-white/80"><span className="text-[11px] font-bold tracking-[.2em]">RECEIVLY / {story.number}</span><span className="h-2 w-2 rounded-full bg-[#a9a9ff]" /></div>
          <div className="absolute inset-x-8 bottom-9 text-white sm:inset-x-10 sm:bottom-10"><span className="script-accent text-4xl text-[#a9a9ff]!">{story.number}</span><h3 className="mt-1 max-w-[380px] font-['Cormorant_Garamond'] text-[2.55rem] leading-[.98] sm:text-[2.9rem]">{story.title}</h3><p className="mt-4 max-w-[370px] text-sm leading-relaxed text-white/80">{story.body}</p></div>
        </article>
      ))}
    </div>
  );
}

export function StorySlider() {
  return (
    <div className="story-marquee relative left-1/2 mt-10 w-screen -translate-x-1/2 overflow-hidden py-7" aria-label="Receivly workflow stories">
      <div className="story-marquee-track">
        <StoryGroup />
        <StoryGroup duplicate />
      </div>
    </div>
  );
}

const AD_IMAGE_URL =
  "https://raw.githubusercontent.com/Gitkierenoffical/image-store-for-cordoval/main/build%20house%20daily%20image%20ad.png";
const AD_LINK = "https://buildhousedaily.beehiiv.com/";

export function BuildHouseDailyAd() {
  return (
    <aside className="footer-ad" aria-label="Sponsored">
      <a
        className="footer-ad-link"
        href={AD_LINK}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          className="footer-ad-image"
          src={AD_IMAGE_URL}
          alt="Build House Daily newsletter"
          width={960}
          height={540}
          loading="lazy"
          decoding="async"
        />
      </a>
    </aside>
  );
}

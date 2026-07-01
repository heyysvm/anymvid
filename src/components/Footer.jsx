import { InstaIcon, GlobeIcon, GithubIcon } from './Icons'

export default function Footer() {
  return (
    <div className="footer">
      <div className="footer-line">
        <a className="footer-link" href="https://instagram.com/heyysvm" target="_blank" rel="noopener noreferrer">
          <InstaIcon />
          <span>@heyysvm</span>
        </a>
        <a className="footer-link" href="https://heyysvm.in" target="_blank" rel="noopener noreferrer">
          <GlobeIcon />
          <span>heyysvm.in</span>
        </a>
        <a className="footer-link" href="https://github.com/heyyvm/anymvid" target="_blank" rel="noopener noreferrer">
          <GithubIcon />
          <span>anymvid</span>
        </a>
      </div>
      <div className="footer-credit">built by heyysvm</div>
    </div>
  )
}

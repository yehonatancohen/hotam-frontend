import { Link } from 'react-router-dom'
import Icon, { WA_URL } from './Icon'

export default function Footer() {
  return (
    <footer className="bg-yellow text-ink">
      <div className="wrap py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr] items-start">
          <div>
            <p className="font-display m-0 misprint" data-text="חותם" style={{ fontSize: 'clamp(80px, 9vw, 128px)', '--under': 'var(--pink)' }}>חותם</p>
            <p className="m-0 mt-4 font-display text-[22px]">חמישה חברים. חותם אחד.</p>
            <p className="m-0 mt-3 max-w-[34ch] font-medium">
              סטודיו קטן לחריטת לייזר על עץ, עור ומתכת. כל פריט יוצא עם חותם משלו — פריט אחד למתנה, או סדרה שלמה לעסק.
            </p>
          </div>

          <div>
            <h2 className="font-display text-[40px] m-0 mb-3">דברו איתנו</h2>
            <ul className="m-0 p-0 list-none space-y-2.5 font-medium">
              <li>
                <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 link-u">
                  <Icon name="whatsapp" size={17} /> <span dir="ltr">052-948-8077</span>
                </a>
              </li>
              <li>
                <a href="mailto:studio@hatam-laser.co.il" className="inline-flex items-center gap-2 link-u">
                  <Icon name="mail" size={17} /> studio@hatam-laser.co.il
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/hotam.studio/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 link-u">
                  <Icon name="instagram" size={17} /> hotam.studio@
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-[40px] m-0 mb-3">שעות</h2>
            <p className="m-0 font-medium tabular">ראשון עד חמישי, 09:00–18:00</p>
            <p className="m-0 mt-1 font-medium">תל אביב</p>
            <Link to="/products" className="btn btn-blue btn-sm mt-6">
              לכל המוצרים
              <Icon name="arrowBack" size={17} />
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t-[2.5px] border-ink flex flex-col sm:flex-row justify-between gap-2 text-[14px] font-medium">
          <span>© {new Date().getFullYear()} חותם, סטודיו לחריטת לייזר</span>
          <span>מודפס ונחרט בתל אביב</span>
        </div>
      </div>
    </footer>
  )
}

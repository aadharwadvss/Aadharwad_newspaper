export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-newspaper-dark text-white mt-auto">
      {/* Decorative top border */}
      <div className="h-1 bg-gradient-to-r from-newspaper-gold via-newspaper-red to-newspaper-gold"></div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4 newspaper-headline text-newspaper-gold">
              आमच्याबद्दल
            </h3>
            <p className="text-sm marathi-text text-gray-300 leading-relaxed">
              आधारवाड डिजिटल वर्तमानपत्र - तुमचे विश्वासू माहिती स्रोत. 
              दररोज ताज्या बातम्या आणि माहितीसाठी आमच्यासोबत राहा.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4 newspaper-headline text-newspaper-gold">
              द्रुत दुवे
            </h3>
            <ul className="space-y-2 text-sm marathi-text">
              <li>
                <a href="/" className="hover:text-newspaper-gold transition-colors">
                  मुख्यपृष्ठ
                </a>
              </li>
              <li>
                <a href="/archive" className="hover:text-newspaper-gold transition-colors">
                  संग्रहालय
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-newspaper-gold transition-colors">
                  प्रशासक प्रवेश
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4 newspaper-headline text-newspaper-gold">
              संपर्क
            </h3>
            <div className="space-y-2 text-sm marathi-text text-gray-300">
              <p>ईमेल: Aadharwad.vss@gmail.com</p>
              <p>फोन: +91 1234567890</p>
              <p className="pt-2 text-xs">
                प्रकाशित: आधारवाड प्रकाशन
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-newspaper-brown mt-8 pt-6 text-center">
          <p className="text-sm marathi-text text-gray-400">
            © {currentYear} आधारवाड डिजिटल वर्तमानपत्र. सर्व हक्क राखीव.
          </p>
          <p className="text-xs text-gray-500 mt-2 font-english">
            Powered by Next.js & Google Drive
          </p>
        </div>
      </div>
    </footer>
  );
}

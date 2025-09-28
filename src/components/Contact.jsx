import '../styles/layout/_contact.scss'

function Contact() {
    return (
        <div className='contact' >
            <h2 className='contact__title'>Contact</h2>
            <ul className='contact__list'>
                    <li className='contact__mail'>
                        Email: grignote@exemple.com
                    </li>
                    <li className='contact__phone'>
                        Téléphone: 0123456789
                    </li>
            </ul>
        </div>
    )
}

export default Contact
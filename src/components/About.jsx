import React from 'react'
import '../styles/layout/_about.scss'

function About() {
    return (
        <div className='about' >
            <h2 className='about__title'>Bienvenue sur le blog Grignote</h2>
          <p className='about__text'>Ce blog vous permet de partager vos recettes de cuisine, 
            de découvrir de nouvelles idées gourmandes et de donner votre avis sur les plats que vous avez testés grâce à l’espace commentaire. Bon appétit !
          </p>
        </div>
    )
}

export default About
import Footer from "./Footer";
import styles from "./Home.module.css";

const myPlot = {
  name: "Kasarani Res ltd",
  location: "Kasarani, Nairobi city",
  slogan: "Invest Smart, Live Better",
};

const plots = {
  bedseaterPrice: "7000",
  bedroom: "12000",
};

function Top() {

    
  return (
    <div className={styles.TopMainDiv}>
      <h1>Welcome to {myPlot.name}. {myPlot.slogan}</h1>
      <h3>Located in {myPlot.location}</h3>
      <a href="mailto:karanires@gmail.com">
        <button className={styles.MoreButton}>Contact us</button>
      </a>
      
    </div>
  );
}

function PlotA() {
  return (
    <>
    <h1 style={{marginLeft: "4%"}}> Our rental Houses </h1>
    <div className={styles.PlotHolverDiv}>
        
      <div className={styles.PlotARooms}>
        <div>
          <img src="/houseb.jpeg" className={styles.PlotARoomspic} alt="Bedseater" />
        </div>
        <div>
          <strong>Bedseater</strong>
          <p>
            Get our bedseater rooms at <br /> an affordable price of Ksh. {plots.bedseaterPrice}
          </p>
          <a href="#" className="NavLinks"> See available rooms👉 </a>
        </div>
      </div>

      <div className={styles.PlotARooms}>
        <div>
          <strong>One bedroom</strong>
          <p>
            Rent our one-bedroom houses, <br /> high quality, spacious at Ksh. {plots.bedroom}
          </p>
          
        </div>
        <div>
          <img src="/housea.jpeg" className={styles.PlotARoomspic} alt="One Bedroom" />
        </div>
        <a href="#" className="NavLinks"> See available rooms👉 </a>
      </div>
    </div>
    </>
  );
}

function Houses() {
  return (
    <div className={styles.HousesDiv}>
      <h1> Your Next Home Awaits </h1>
      <p>
        Want to experience and live in the beauty of Kasarani? The place is here for you. Reach out for more information.
      </p>
      <a href="mailto:kasaranires@gmail.com">
        <button className={styles.HousesButton}>Reach out</button>
      </a>
      
    </div>
  );
}

function Water() {
  return (
    <div>
      <h1 style={{ marginLeft: "4%" }}>Water supply services</h1>
      <div className={styles.WaterDiv}>
        {/*<div className={styles.WaterSubDiv}>*/}
          <div className={styles.dropWr}>
            <img src="/drop.jpeg" className={styles.dropW} alt="Water Drop 1" />
            <img src="/water.jpg" className={styles.dropW} alt="Water Drop 2" />
          </div>
        {/*</div>*/}
        <div className={styles.WaterSubDiv}>
          <h1>Who we are</h1>
          <p>
            We supply water across Santon area, {myPlot.location}. <br />
            Become one of our happy customers and enjoy our high quality, all-time services.
          </p>
        </div>
      </div>

      <strong>
        <p className={styles.WaterPoints}>Pure water, Deep from the earth</p>
        <div className={styles.dropWr}>
          <img src="/drop.jpeg" className={styles.dropW} alt="Water Drop 1" />
          <img src="/water.jpg" className={styles.dropW} alt="Water Drop 2" />
        </div>
        <p className={styles.WaterPoints}>Clean water, Every drop counts</p>
      </strong>

      <h1 style={{ marginLeft: "4%" }}>Why choose us</h1>
      <div className={styles.WaterUs}>
        <div className={styles.WaterUsDivs}>
          <h3>Experienced team</h3>
          <p>
            Our team is made up of highly dedicated individuals 
            with passion in water supply, distribution, 
            and customer support. We combine this expertise with 
            a deep understanding of the community’s needs to deliver 
            reliable, safe, and efficient water services.
          </p>
        </div>

        <div className={styles.WaterUsDivs}>
          <h3>Integrity</h3>
          <p>
            We believe in doing what is right—every time. Our
             operations are guided by honesty, transparency,
              and accountability. Integrity is at the heart of
               how we build trust and long-lasting relationships
                with our customers.
          </p>
        </div>
      </div>
    </div>
  );
}

function Home() {

    
  return (
    <>
      <Top />
      <PlotA />
      <Houses />
      <Water />
      <Footer />
    </>
  );
}

export default Home;

const Home = () => {

    return (
        <div>

            <h1 className="!text-[80px] m-5 text-center">Angus' Bike Calculator</h1>

            <div className="max-w-[800px] text-center mx-auto text-xl text-white bg-[rgba(44,46,58,0.8)] p-5 rounded-[10px] mb-10">
                I created this out of passion for the sport. Containing a number of calculators which I believe are a necessity when working out gear ratios.<br />
                A number of these used to be available on other websites but with updates they have disappeared or become harder to use.<br />
                <br />
                My favourite piece of functionality is only useful to Brisbane residents with a map of the inner city bike racks and greater Brisbane area taps.<br />
                <br />
            </div>

            <div className="flex mx-auto justify-around flex-wrap max-w-[1200px] w-full p-2.5 items-stretch">

                <a href="/map" className="text-white !no-underline flex-1 m-2.5">
                    <div className="bg-[rgba(5,1,68,0.7)] text-white rounded-[10px] p-5 text-center transition-transform duration-300 h-full">
                        <h3>Map</h3>
                        <p>Map of Brisbane, containing locations of bicycle racks and taps</p>
                    </div>
                </a>
                
                <a href="/speed" className="text-white !no-underline flex-1 m-2.5">
                    <div className="bg-[rgba(5,1,68,0.7)] text-white rounded-[10px] p-5 text-center transition-transform duration-300 h-full">
                        <h3>Speed</h3>
                        <p>Choose some gears, choose a range of cadences and see how fast you can go</p>
                    </div>
                </a>
                
                <a href="/rollout" className="text-white !no-underline flex-1 m-2.5">
                    <div className="bg-[rgba(5,1,68,0.7)] text-white rounded-[10px] p-5 text-center transition-transform duration-300 h-full">
                        <h3>Rollout</h3>
                        <p>Check if you're within your rollout restrictions, particularly useful for juniors</p>
                    </div>
                </a>
                
                <a href="/ratios" className="text-white !no-underline flex-1 m-2.5">
                    <div className="bg-[rgba(5,1,68,0.7)] text-white rounded-[10px] p-5 text-center transition-transform duration-300 h-full">
                        <h3>Ratios</h3>
                        <p>Get deep into individual gear ratios for whatever gears you choose</p>
                    </div>
                </a>
            </div>
        </div>
    );
}

export default Home
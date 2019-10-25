# parking-system

## ALPR Simulation

Here we can simulate the system.

## Installation

The alpr system used is [openalpr](https://github.com/openalpr/openalpr). Installation was tested on MAC OSX version 10.14.6 with the following commands, thanks to https://github.com/openalpr/openalpr/issues/658.

```bash
brew install tesseract opencv@3 log4cplus
brew cask install java
git clone https://github.com/openalpr/openalpr.git
cd openalpr/src ; mkdir build; cd build
export OpenCV_DIR="/usr/local/opt/opencv@3/"
cmake .. -DCMAKE_INSTALL_PREFIX:PATH=/usr/local -DCMAKE_INSTALL_SYSCONFDIR:PATH=/etc -DCMAKE_MACOSX_RPATH=true -DCMAKE_CXX_FLAGS="-std=c++11"
make
sudo make install
```

To test the library

```bash
wget http://plates.openalpr.com/ea7the.jpg
alpr -c us ea7the.jpg
```

Python libraries needed

```bash
pip3 install requests openalpr
```

Database with licence plate number

```bash
mkdir data && cd data
wget http://www.zemris.fer.hr/projects/LicensePlates/english/baza_slika.zip
unzip baza_slika.zip
rm baza_slika.zip
sudo chmod -R 764 .
find . -name "*jpg" -mindepth 1 -exec mv {} ./ \;
rm -r 141002 170902 180902 210503 280503 070603 040603
```

## Usage

Run the python script to simulate events.

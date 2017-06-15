# choose the image according to the language chosen in .travis.yml
$ docker run -it -u travis quay.io/travisci/travis-jvm /bin/bash

# now that you are in the docker image, switch to the travis user
sudo - travis

# Install a recent ruby (default is 1.9.3)
rvm install 2.3.0
rvm use 2.3.0

# Install travis-build to generate a .sh out of .travis.yml
cd builds
git clone https://github.com/travis-ci/travis-build.git
cd travis-build
gem install travis
travis # to create ~/.travis
ln -s `pwd` ~/.travis/travis-build
bundle install

# Create project dir, assuming your project is `AUTHOR/PROJECT` on GitHub
cd ~/builds
mkdir AUTHOR
cd AUTHOR
git clone https://github.com/AUTHOR/PROJECT.git
cd PROJECT
# change to the branch or commit you want to investigate
travis compile > ci.sh
# You most likely will need to edit ci.sh as it ignores matrix and env
bash ci.sh

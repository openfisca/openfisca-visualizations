.PHONY: jshint

all: jshint

jshint:
	jshint --exclude bower_components . | sed 's/ line \([0-9]\+\), col \([0-9]\+\), /\1:\2:/'

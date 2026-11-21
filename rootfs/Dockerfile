FROM --platform=linux/arm64 debian:trixie-slim
ENV DEBIAN_FRONTEND=noninteractive
RUN printf 'path-exclude /usr/share/doc/*\npath-exclude /usr/share/man/*\npath-exclude /usr/share/info/*\npath-include /usr/share/locale/en*\npath-exclude /usr/share/locale/*\n' > /etc/dpkg/dpkg.cfg.d/01_nodoc && \
    printf 'APT::Install-Recommends "false";\nAPT::Install-Suggests "false";\n' > /etc/apt/apt.conf.d/01norecommends && \
    apt-get update && apt-get install -y \
      firefox-esr ca-certificates fonts-dejavu-core fonts-noto-core fonts-noto-color-emoji \
      libgl1-mesa-dri libegl1 libgles2 mesa-utils-bin \
      dbus dbus-user-session procps less nano locales tzdata \
      libpulse0 alsa-utils libasound2-plugins \
      && sed -i 's/# en_US.UTF-8/en_US.UTF-8/' /etc/locale.gen && locale-gen \
      && apt-get clean && rm -rf /var/lib/apt/lists/*

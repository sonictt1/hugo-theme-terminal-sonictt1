+++
title = "{{ replace .TranslationBaseName "-" " " | title }}"
date = "{{ .Date }}"
author = ""
tags = ["decklist"]
keywords = ["mtg", "magic", "deck"]
description = ""
showFullContent = false
readingTime = false
hideComments = false
+++

{{< deck-table file="static/decks/YOUR_DECK_FILE.deck" >}}{{< /deck-table >}}

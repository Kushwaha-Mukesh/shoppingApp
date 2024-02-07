class WhereClause {
  constructor(base, bigQuery) {
    this.base = base;
    this.bigQuery = bigQuery;
  }

  search() {
    const searchWord = this.bigQuery.search
      ? {
          name: {
            $regex: this.bigQuery.searchWord,
            $options: "i",
          },
        }
      : {};

    this.base = this.base.find({ ...searchWord });
    return this;
  }

  filter() {
    const copyQuery = { ...this.bigQuery };
    delete copyQuery["search"];
    delete copyQuery["limit"];
    delete copyQuery["page"];

    // convert copyQuery object to string
    let stringOfCopyQuery = JSON.stringify(copyQuery);

    stringOfCopyQuery = stringOfCopyQuery.replace(
      /\b(gte | lte | gt | lt)\b/g,
      (m) => `$${m}`
    );

    const jsonOfCopyQuery = JSON.parse(stringOfCopyQuery);

    this.base = this.base.find(jsonOfCopyQuery);
    return this;
  }

  pager(resultPerPage) {
    let currentPage = 1;
    if (this.bigQuery.page) {
      currentPage = this.bigQuery.page;
    }

    const skipval = resultPerPage * (currentPage - 1);

    // here limit sets the no.of products that is sent for first reques. and skip means how many products should be skip on the next page.
    this.base = this.base.limit(resultPerPage).skip(skipval);
    return this;
  }
}

module.exports = WhereClause;
